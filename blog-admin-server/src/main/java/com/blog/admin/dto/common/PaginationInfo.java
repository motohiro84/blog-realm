package com.blog.admin.dto.common;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PaginationInfo {
    private int currentPage;
    private int totalItems;
    private int itemsPerPage;
}
