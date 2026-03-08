package com.blog.admin.service;

import com.blog.admin.dto.master.MasterResponse;
import com.blog.admin.exception.BusinessException;
import com.blog.admin.exception.ErrorCode;
import com.blog.admin.mapper.MasterMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MasterService {

    private final MasterMapper masterMapper;

    public MasterResponse getByCategory(String category) {
        if (!masterMapper.existsCategory(category)) {
            throw new BusinessException(ErrorCode.MASTER_CATEGORY_NOT_FOUND);
        }
        var masters = masterMapper.findByCategory(category).stream()
            .map(m -> MasterResponse.MasterItem.builder()
                .code(m.getCode()).name(m.getDisplayName()).displayOrder(m.getDisplayOrder()).build())
            .toList();
        return MasterResponse.builder().masters(masters).build();
    }
}
