package com.blog.admin.dto.auth;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class UserInfoResponse {
    private Integer userId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private List<String> roles;
    private ProfileInfo profile;

    @Data
    @Builder
    public static class ProfileInfo {
        private String displayName;
        private String avatarUrl;
        private String bio;
        private Boolean isPublic;
    }
}
