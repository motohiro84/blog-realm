package com.blog.admin.dto.post;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PostApproveRequest {
    @NotNull(message = "draftIdは必須です")
    private Integer draftId;
}
