package com.blog.admin.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BlogImageDraft {
    private Integer imageId;
    private Integer draftId;
    private String imageUrl;
    private Boolean isThumbnail;
    private Integer displayOrder;
    private Boolean isDeleted;
    private LocalDateTime createdAt;
}
