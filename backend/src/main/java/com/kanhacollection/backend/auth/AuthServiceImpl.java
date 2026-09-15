package com.kanhacollection.backend.auth;

import com.kanhacollection.backend.auth.dto.*;
import com.kanhacollection.backend.cart.Cart;
import com.kanhacollection.backend.cart.CartRepository;
import com.kanhacollection.backend.exception.BadRequestException;
import com.kanhacollection.backend.exception.DuplicateResourceException;
import com.kanhacollection.backend.exception.ResourceNotFoundException;
import com.kanhacollection.backend.exception.UnauthorizedException;
import com.kanhacollection.backend.user.Role;
import com.kanhacollection.backend.user.User;
import com.kanhacollection.backend.user.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);
    private static final String REFRESH_TOKEN_PREFIX = "auth:refresh_token:";
    private static final String RESET_TOKEN_PREFIX = "auth:reset_token:";

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final StringRedisTemplate redisTemplate;

    @Value("${app.jwt.cookie-name:kanha_refresh_token}")
    private String cookieName;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request, HttpServletResponse response) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new DuplicateResourceException("An account with this email address already exists.");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.ROLE_USER)
                .enabled(true)
                .emailVerified(false)
                .build();

        User savedUser = userRepository.save(user);

        // Create empty cart for new user
        Cart cart = Cart.builder().user(savedUser).build();
        cartRepository.save(cart);

        UserPrincipal userPrincipal = UserPrincipal.create(savedUser);
        Authentication authentication = new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = tokenProvider.generateAccessToken(userPrincipal);
        String refreshToken = tokenProvider.generateRefreshToken(savedUser.getId());

        saveRefreshTokenInRedis(savedUser.getId(), refreshToken);
        setRefreshTokenCookie(response, refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole().name())
                .build();
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        String accessToken = tokenProvider.generateAccessToken(userPrincipal);
        String refreshToken = tokenProvider.generateRefreshToken(user.getId());

        saveRefreshTokenInRedis(user.getId(), refreshToken);
        setRefreshTokenCookie(response, refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }

    @Override
    public AuthResponse refreshToken(String refreshTokenCookie, String requestHeaderToken, HttpServletResponse response) {
        String refreshToken = StringUtils.hasText(refreshTokenCookie) ? refreshTokenCookie : requestHeaderToken;

        if (!StringUtils.hasText(refreshToken) || !tokenProvider.validateToken(refreshToken)) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        UUID userId = tokenProvider.getUserIdFromJwt(refreshToken);
        String cachedToken = redisTemplate.opsForValue().get(REFRESH_TOKEN_PREFIX + userId);

        if (cachedToken == null || !cachedToken.equals(refreshToken)) {
            throw new UnauthorizedException("Refresh token is revoked or no longer valid");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        UserPrincipal userPrincipal = UserPrincipal.create(user);
        String newAccessToken = tokenProvider.generateAccessToken(userPrincipal);
        String newRefreshToken = tokenProvider.generateRefreshToken(user.getId());

        saveRefreshTokenInRedis(user.getId(), newRefreshToken);
        setRefreshTokenCookie(response, newRefreshToken);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }

    @Override
    public void logout(String refreshTokenCookie, HttpServletResponse response) {
        if (StringUtils.hasText(refreshTokenCookie) && tokenProvider.validateToken(refreshTokenCookie)) {
            UUID userId = tokenProvider.getUserIdFromJwt(refreshTokenCookie);
            redisTemplate.delete(REFRESH_TOKEN_PREFIX + userId);
        }

        clearRefreshTokenCookie(response);
        SecurityContextHolder.clearContext();
    }

    @Override
    @Transactional(readOnly = true)
    public UserSummaryResponse getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return UserSummaryResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .emailVerified(user.isEmailVerified())
                .build();
    }

    @Override
    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Revoke existing refresh token to force re-login on other sessions
        redisTemplate.delete(REFRESH_TOKEN_PREFIX + userId);
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        // Do not throw error if email does not exist to prevent user enumeration attacks
        userRepository.findByEmail(request.getEmail().toLowerCase()).ifPresent(user -> {
            String resetToken = UUID.randomUUID().toString();
            redisTemplate.opsForValue().set(RESET_TOKEN_PREFIX + resetToken, user.getId().toString(), Duration.ofHours(1));
            log.info("Password reset token generated for email {}: {}", user.getEmail(), resetToken);
            // Async email notification dispatch will handle sending email
        });
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String userIdStr = redisTemplate.opsForValue().get(RESET_TOKEN_PREFIX + request.getToken());
        if (userIdStr == null) {
            throw new BadRequestException("Invalid or expired password reset token");
        }

        UUID userId = UUID.fromString(userIdStr);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        redisTemplate.delete(RESET_TOKEN_PREFIX + request.getToken());
        redisTemplate.delete(REFRESH_TOKEN_PREFIX + userId);
    }

    private void saveRefreshTokenInRedis(UUID userId, String refreshToken) {
        long expirationMs = tokenProvider.getRefreshTokenExpirationMs();
        redisTemplate.opsForValue().set(REFRESH_TOKEN_PREFIX + userId, refreshToken, Duration.ofMillis(expirationMs));
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        long expirationSeconds = tokenProvider.getRefreshTokenExpirationMs() / 1000;
        ResponseCookie cookie = ResponseCookie.from(cookieName, refreshToken)
                .httpOnly(true)
                .secure(false) // Set to true in production SSL environment
                .path("/api/v1/auth")
                .maxAge(expirationSeconds)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(false)
                .path("/api/v1/auth")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
