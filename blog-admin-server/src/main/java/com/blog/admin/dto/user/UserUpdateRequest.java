package com.blog.admin.dto.user;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UserUpdateRequest {
    @NotNull(message = "userIdは必須です")
    private Integer userId;

    @Size(max = 50, message = "displayNameは50文字以内で入力してください")
    private String displayName;

    private String avatarUrl;

    @Size(max = 500, message = "bioは500文字以内で入力してください")
    private String bio;

    private Boolean isPublic;
}
