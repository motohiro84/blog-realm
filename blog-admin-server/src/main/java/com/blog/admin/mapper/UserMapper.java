package com.blog.admin.mapper;

import com.blog.admin.model.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface UserMapper {
    User findByKeycloakId(@Param("keycloakId") String keycloakId);
    User findById(@Param("userId") int userId);
    User findByIdWithPostCount(@Param("userId") int userId);
    List<User> findAll(@Param("role") String role, @Param("search") String search,
                       @Param("limit") int limit, @Param("offset") int offset);
    int countAll(@Param("role") String role, @Param("search") String search);
    int updateProfile(User user);
}
