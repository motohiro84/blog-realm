package com.blog.admin.mapper;

import com.blog.admin.model.BlogPostDraft;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface DashboardMapper {
    List<BlogPostDraft> findUserDraftsByStatus(
        @Param("authorId") int authorId, @Param("status") String status, @Param("limit") int limit);
    List<BlogPostDraft> findAwaitingApproval(@Param("limit") int limit);
}
