package com.blog.admin.mapper;

import com.blog.admin.model.BlogImageDraft;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ImageDraftMapper {
    List<BlogImageDraft> findByDraftId(@Param("draftId") int draftId);
    int insertBatch(@Param("images") List<BlogImageDraft> images);
    int softDeleteByDraftId(@Param("draftId") int draftId);
}
