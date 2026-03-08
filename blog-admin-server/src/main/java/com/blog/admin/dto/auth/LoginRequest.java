package com.blog.admin.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "usernameは必須です")
    private String username;

    @NotBlank(message = "passwordは必須です")
    private String password;
}
