package com.blog.admin.dto.master;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MasterRequest {
    @NotBlank(message = "categoryは必須です")
    private String category;
}
