package com.blog.admin.dto.post;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class PostCreateRequest {
    @NotBlank(message = "titleは必須です")
    @Size(max = 200, message = "titleは200文字以内で入力してください")
    private String title;

    @NotBlank(message = "contentは必須です")
    @Size(max = 50000, message = "contentは50000文字以内で入力してください")
    private String content;

    @NotBlank(message = "categoryは必須です")
    @Pattern(regexp = "TECH|DIARY|REVIEW", message = "categoryはTECH/DIARY/REVIEWのいずれか")
    private String category;

    @NotNull(message = "submitは必須です")
    private Boolean submit;

    private List<ImageInfo> images;
}
