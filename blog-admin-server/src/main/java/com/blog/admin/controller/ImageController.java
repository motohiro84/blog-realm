package com.blog.admin.controller;

import com.blog.admin.dto.image.ImageUploadResponse;
import com.blog.admin.service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/images")
@RequiredArgsConstructor
public class ImageController {

    private final ImageService imageService;

    @PostMapping
    public ResponseEntity<ImageUploadResponse> upload(@RequestParam("files") MultipartFile[] files) {
        return ResponseEntity.status(HttpStatus.CREATED).body(imageService.upload(files));
    }
}
