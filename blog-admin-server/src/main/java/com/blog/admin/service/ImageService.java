package com.blog.admin.service;

import com.blog.admin.dto.image.ImageUploadResponse;
import com.blog.admin.exception.BusinessException;
import com.blog.admin.exception.ErrorCode;
import com.blog.admin.mapper.UserMapper;
import com.blog.admin.model.User;
import com.blog.admin.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ImageService {

    private final S3Client s3Client;
    private final UserMapper userMapper;

    @Value("${seaweedfs.bucket}")
    private String bucket;

    @Value("${seaweedfs.public-url}")
    private String publicUrl;

    private static final Set<String> ALLOWED_TYPES = Set.of(
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp");

    public ImageUploadResponse upload(MultipartFile[] files) {
        User user = userMapper.findByKeycloakId(SecurityUtils.getCurrentKeycloakId());
        if (user == null) throw new BusinessException(ErrorCode.USER_NOT_FOUND);

        List<ImageUploadResponse.ImageItem> uploadedImages = new ArrayList<>();

        for (MultipartFile file : files) {
            if (!ALLOWED_TYPES.contains(file.getContentType())) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR);
            }

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
            String uuid = UUID.randomUUID().toString().substring(0, 8);
            String ext = getExtension(file.getOriginalFilename());
            String key = "users/" + user.getUserId() + "/" + timestamp + "_" + uuid + "." + ext;

            try {
                s3Client.putObject(
                    PutObjectRequest.builder().bucket(bucket).key(key)
                        .contentType(file.getContentType()).build(),
                    RequestBody.fromBytes(file.getBytes()));

                uploadedImages.add(ImageUploadResponse.ImageItem.builder()
                    .url(publicUrl + "/" + bucket + "/" + key).build());
            } catch (Exception e) {
                throw new BusinessException(ErrorCode.IMAGE_UPLOAD_FAILED);
            }
        }

        return ImageUploadResponse.builder().images(uploadedImages).build();
    }

    private String getExtension(String filename) {
        if (filename == null) return "jpg";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot + 1).toLowerCase() : "jpg";
    }
}
