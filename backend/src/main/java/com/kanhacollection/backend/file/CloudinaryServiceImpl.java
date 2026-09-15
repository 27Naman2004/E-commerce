package com.kanhacollection.backend.file;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.kanhacollection.backend.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryServiceImpl implements CloudinaryService {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryServiceImpl.class);

    @Value("${app.cloudinary.cloud-name:demo_cloud}")
    private String cloudName;

    @Value("${app.cloudinary.api-key:1234567890}")
    private String apiKey;

    @Value("${app.cloudinary.api-secret:sampleCloudinarySecret}")
    private String apiSecret;

    private Cloudinary cloudinary;

    @PostConstruct
    public void init() {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
    }

    @Override
    @SuppressWarnings("unchecked")
    public Map<String, Object> uploadImage(MultipartFile file, String folder) {
        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded image file is empty.");
        }

        try {
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "folder", folder != null ? folder : "kanha_collection/products",
                    "resource_type", "image"
            );

            Map<String, Object> result = (Map<String, Object>) cloudinary.uploader().upload(file.getBytes(), uploadParams);
            log.info("Successfully uploaded image to Cloudinary with public_id: {}", result.get("public_id"));
            return result;
        } catch (IOException ex) {
            log.error("Failed to upload image to Cloudinary", ex);
            throw new BadRequestException("Image upload failed: " + ex.getMessage());
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public Map<String, Object> deleteImage(String publicId) {
        try {
            Map<String, Object> result = (Map<String, Object>) cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("Deleted image from Cloudinary with public_id: {}", publicId);
            return result;
        } catch (IOException ex) {
            log.error("Failed to delete image from Cloudinary with public_id {}", publicId, ex);
            throw new BadRequestException("Image deletion failed: " + ex.getMessage());
        }
    }
}
