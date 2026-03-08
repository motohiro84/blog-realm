package com.blog.admin.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BlogPostHistory {
    private Integer historyId;
    private Integer postId;
    private Integer version;
    private String title;
    private String content;
    private String category;
    private String thumbnailUrl;
    private LocalDateTime approvedAt;
    private Integer approvedById;
    private LocalDateTime createdAt;
    private String approvedByName;
}
