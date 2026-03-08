package com.blog.admin.dto.post;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PostDetailResponse {
    private Integer draftId;
    private String title;
    private String content;
    private String category;
    private String status;
    private String thumbnailUrl;
    private Boolean isPublic;
    private Integer publishedPostId;
    private Integer authorId;
    private String authorName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime approvedAt;
    private Integer approvedById;
    private String approvedByName;
    private LocalDateTime rejectedAt;
    private Integer rejectedById;
    private String rejectedByName;
    private String rejectionReason;
    private List<ImageItem> images;

    @Data
    @Builder
    public static class ImageItem {
        private Integer imageId;
        private String imageUrl;
        private Boolean isThumbnail;
    }
}
