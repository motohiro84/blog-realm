package com.blog.admin.dto.post;

import com.blog.admin.dto.common.PaginationInfo;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PostListResponse {
    private List<PostSummary> posts;
    private PaginationInfo pagination;

    @Data
    @Builder
    public static class PostSummary {
        private Integer draftId;
        private String title;
        private String category;
        private String status;
        private String thumbnailUrl;
        private Integer authorId;
        private String authorName;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
