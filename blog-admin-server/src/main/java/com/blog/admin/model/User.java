package com.blog.admin.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class User {
    private Integer userId;
    private String keycloakId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private String displayName;
    private String profileImageUrl;
    private String bio;
    private Boolean isPublic;
    private Boolean isDeleted;
    private LocalDateTime deletedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // 集計用
    private Integer postCount;
}
