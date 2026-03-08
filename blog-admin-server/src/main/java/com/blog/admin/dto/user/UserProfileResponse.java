package com.blog.admin.dto.user;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class UserProfileResponse {
    private Integer userId;
    private String username;
    private String email;
    private String lastName;
    private String firstName;
    private String role;
    private String displayName;
    private String avatarUrl;
    private String bio;
    private Boolean isPublic;
    private Integer postCount;
    private LocalDateTime createdAt;
}
