package com.kanhacollection.backend.file;

import com.kanhacollection.backend.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/admin/files")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Tag(name = "File Asset Module", description = "Cloudinary image upload and deletion endpoints for admin catalog management")
public class FileController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/upload")
    @Operation(summary = "Upload image file to Cloudinary CDN (Admin)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false, defaultValue = "kanha_collection/products") String folder) {
        Map<String, Object> uploadResult = cloudinaryService.uploadImage(file, folder);
        return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", uploadResult));
    }

    @DeleteMapping
    @Operation(summary = "Delete image file from Cloudinary CDN by public ID (Admin)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteImage(@RequestParam("publicId") String publicId) {
        Map<String, Object> deleteResult = cloudinaryService.deleteImage(publicId);
        return ResponseEntity.ok(ApiResponse.success("Image deleted successfully", deleteResult));
    }
}
