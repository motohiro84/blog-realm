package com.blog.admin.dto.master;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class MasterResponse {
    private List<MasterItem> masters;

    @Data
    @Builder
    public static class MasterItem {
        private String code;
        private String name;
        private Integer displayOrder;
    }
}
