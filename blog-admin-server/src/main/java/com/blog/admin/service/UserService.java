package com.blog.admin.service;

import com.blog.admin.dto.common.PaginationInfo;
import com.blog.admin.dto.user.*;
import com.blog.admin.exception.BusinessException;
import com.blog.admin.exception.ErrorCode;
import com.blog.admin.mapper.UserMapper;
import com.blog.admin.model.User;
import com.blog.admin.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;

    public UserProfileResponse getProfile(int userId) {
        if (!SecurityUtils.isAdmin()) {
            User current = userMapper.findByKeycloakId(SecurityUtils.getCurrentKeycloakId());
            if (current == null || current.getUserId() != userId) {
                throw new BusinessException(ErrorCode.FORBIDDEN);
            }
        }
        User user = userMapper.findByIdWithPostCount(userId);
        if (user == null) throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        return toProfileResponse(user);
    }

    public UserProfileResponse updateProfile(UserUpdateRequest req) {
        if (!SecurityUtils.isAdmin()) {
            User current = userMapper.findByKeycloakId(SecurityUtils.getCurrentKeycloakId());
            if (current == null || !current.getUserId().equals(req.getUserId())) {
                throw new BusinessException(ErrorCode.FORBIDDEN);
            }
        }
        User user = userMapper.findById(req.getUserId());
        if (user == null) throw new BusinessException(ErrorCode.USER_NOT_FOUND);

        if (req.getDisplayName() != null) user.setDisplayName(req.getDisplayName());
        if (req.getAvatarUrl() != null) user.setProfileImageUrl(req.getAvatarUrl());
        if (req.getBio() != null) user.setBio(req.getBio());
        if (req.getIsPublic() != null) user.setIsPublic(req.getIsPublic());
        userMapper.updateProfile(user);

        return getProfile(req.getUserId());
    }

    public UserListResponse getUsers(String role, String search, int page, int limit) {
        int offset = (page - 1) * limit;
        List<User> users = userMapper.findAll(role, search, limit, offset);
        int total = userMapper.countAll(role, search);

        return UserListResponse.builder()
            .users(users.stream().map(u -> UserListResponse.UserSummary.builder()
                .userId(u.getUserId()).lastName(u.getLastName()).firstName(u.getFirstName())
                .email(u.getEmail()).role(u.getRole()).avatarUrl(u.getProfileImageUrl())
                .postCount(u.getPostCount()).createdAt(u.getCreatedAt()).build()).toList())
            .pagination(new PaginationInfo(page, total, limit))
            .build();
    }

    private UserProfileResponse toProfileResponse(User u) {
        return UserProfileResponse.builder()
            .userId(u.getUserId()).username(u.getUsername()).email(u.getEmail())
            .lastName(u.getLastName()).firstName(u.getFirstName()).role(u.getRole())
            .displayName(u.getDisplayName()).avatarUrl(u.getProfileImageUrl())
            .bio(u.getBio()).isPublic(u.getIsPublic())
            .postCount(u.getPostCount()).createdAt(u.getCreatedAt()).build();
    }
}
