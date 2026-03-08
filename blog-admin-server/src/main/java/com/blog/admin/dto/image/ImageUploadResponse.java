package com.blog.admin.dto.image;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ImageUploadResponse {
    private List<ImageItem> images;

    @Data
    @Builder
    public static class ImageItem {
        private String url;
    }
}
