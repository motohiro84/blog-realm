package com.blog.admin.dto.dashboard;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class DashboardResponse {
    private List<DashboardPost> draftPosts;
    private List<DashboardPost> pendingPosts;
    private List<DashboardPost> rejectedPosts;
    private List<DashboardPost> awaitingApprovalPosts;

    @Data
    @Builder
    public static class DashboardPost {
        private Integer draftId;
        private String title;
        private String thumbnailUrl;
        private String authorName;
        private LocalDateTime updatedAt;
    }
}
