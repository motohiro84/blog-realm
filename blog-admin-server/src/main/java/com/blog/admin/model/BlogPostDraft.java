package com.blog.admin.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BlogPostDraft {
    private Integer draftId;
    private Integer authorId;
    private String title;
    private String content;
    private String category;
    private String status;
    private Integer publishedPostId;
    private LocalDateTime submittedAt;
    private LocalDateTime approvedAt;
    private Integer approvedById;
    private LocalDateTime rejectedAt;
    private Integer rejectedById;
    private String rejectionReason;
    private Boolean isDeleted;
    private LocalDateTime deletedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // JOIN結果
    private String authorName;
    private String thumbnailUrl;
    private String approvedByName;
    private String rejectedByName;
}
