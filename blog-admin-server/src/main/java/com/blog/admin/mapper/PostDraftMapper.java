package com.blog.admin.mapper;

import com.blog.admin.model.BlogPostDraft;
import com.blog.admin.dto.post.PostSearchCondition;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface PostDraftMapper {
    List<BlogPostDraft> findByCondition(@Param("cond") PostSearchCondition condition);
    int countByCondition(@Param("cond") PostSearchCondition condition);
    BlogPostDraft findById(@Param("draftId") int draftId);
    BlogPostDraft findByIdWithDetail(@Param("draftId") int draftId);
    int insert(BlogPostDraft post);
    int update(BlogPostDraft post);
    int softDelete(@Param("draftId") int draftId);
}
