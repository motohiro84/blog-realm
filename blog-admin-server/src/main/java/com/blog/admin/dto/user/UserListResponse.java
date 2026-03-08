package com.blog.admin.dto.user;

import com.blog.admin.dto.common.PaginationInfo;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class UserListResponse {
    private List<UserSummary> users;
    private PaginationInfo pagination;

    @Data
    @Builder
    public static class UserSummary {
        private Integer userId;
        private String lastName;
        private String firstName;
        private String email;
        private String role;
        private String avatarUrl;
        private Integer postCount;
        private LocalDateTime createdAt;
    }
}
