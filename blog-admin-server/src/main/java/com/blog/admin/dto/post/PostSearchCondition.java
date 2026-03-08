package com.blog.admin.dto.post;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PostSearchCondition {
    private String status;
    private String category;
    private String keyword;
    private Integer authorId;
    private String startDate;
    private String endDate;
    private int limit;
    private int offset;
}
