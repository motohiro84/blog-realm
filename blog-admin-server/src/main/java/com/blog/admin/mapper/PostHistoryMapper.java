package com.blog.admin.mapper;

import com.blog.admin.model.BlogPostHistory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface PostHistoryMapper {
    List<BlogPostHistory> findByPostId(@Param("postId") int postId);
    BlogPostHistory findById(@Param("historyId") int historyId);
    int insert(BlogPostHistory history);
}
