package com.blog.admin.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Master {
    private Integer masterId;
    private String category;
    private String code;
    private String displayName;
    private Integer displayOrder;
    private LocalDateTime createdAt;
}
