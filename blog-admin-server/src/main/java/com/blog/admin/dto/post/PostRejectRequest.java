package com.blog.admin.dto.post;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class PostRejectRequest {
    @NotNull(message = "draftIdは必須です")
    private Integer draftId;

    @NotBlank(message = "rejectionReasonは必須です")
    @Size(max = 500, message = "rejectionReasonは500文字以内で入力してください")
    private String rejectionReason;
}
