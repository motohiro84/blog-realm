package com.blog.admin.mapper;

import com.blog.admin.model.BlogImagePublished;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ImagePublishedMapper {
    List<BlogImagePublished> findByPostId(@Param("postId") int postId);
    int insertBatch(@Param("images") List<BlogImagePublished> images);
    int softDeleteByPostId(@Param("postId") int postId);
}
