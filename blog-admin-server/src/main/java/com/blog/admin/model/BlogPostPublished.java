package com.blog.admin.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BlogPostPublished {
    private Integer postId;
    private Integer authorId;
    private String title;
    private String slug;
    private String content;
    private String category;
    private Boolean isPublic;
    private LocalDateTime approvedAt;
    private Integer approvedById;
    private LocalDateTime publishedAt;
    private LocalDateTime lastUpdatedAt;
    private Boolean isDeleted;
    private LocalDateTime deletedAt;
    private LocalDateTime createdAt;
    // JOIN結果
    private String authorName;
    private String approvedByName;
}
