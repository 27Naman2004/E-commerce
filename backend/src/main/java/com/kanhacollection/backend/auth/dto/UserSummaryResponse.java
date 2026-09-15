package com.kanhacollection.backend.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryResponse {

    private UUID id;
    private String email;
    private String fullName;
    private String phone;
    private String role;
    private boolean emailVerified;
}
