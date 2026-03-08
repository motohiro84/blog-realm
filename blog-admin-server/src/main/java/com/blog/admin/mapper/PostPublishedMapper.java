package com.blog.admin.mapper;

import com.blog.admin.model.BlogPostPublished;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PostPublishedMapper {
    BlogPostPublished findById(@Param("postId") int postId);
    BlogPostPublished findByIdWithDetail(@Param("postId") int postId);
    int insert(BlogPostPublished post);
    int update(BlogPostPublished post);
    int setUnpublished(@Param("postId") int postId);
    int softDelete(@Param("postId") int postId);
    boolean existsBySlug(@Param("slug") String slug);
    int getMaxVersion(@Param("postId") int postId);
}
