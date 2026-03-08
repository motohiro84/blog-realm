package com.blog.admin.service;

import com.blog.admin.dto.dashboard.DashboardResponse;
import com.blog.admin.exception.BusinessException;
import com.blog.admin.exception.ErrorCode;
import com.blog.admin.mapper.DashboardMapper;
import com.blog.admin.mapper.UserMapper;
import com.blog.admin.model.User;
import com.blog.admin.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final DashboardMapper dashboardMapper;
    private final UserMapper userMapper;

    public DashboardResponse getDashboard() {
        User user = userMapper.findByKeycloakId(SecurityUtils.getCurrentKeycloakId());
        if (user == null) throw new BusinessException(ErrorCode.USER_NOT_FOUND);

        if (SecurityUtils.isAdmin()) {
            var posts = dashboardMapper.findAwaitingApproval(10).stream()
                .map(d -> DashboardResponse.DashboardPost.builder()
                    .draftId(d.getDraftId()).title(d.getTitle())
                    .thumbnailUrl(d.getThumbnailUrl()).authorName(d.getAuthorName())
                    .updatedAt(d.getUpdatedAt()).build())
                .toList();
            return DashboardResponse.builder().awaitingApprovalPosts(posts).build();
        } else {
            int uid = user.getUserId();
            return DashboardResponse.builder()
                .draftPosts(mapDashboardPosts(dashboardMapper.findUserDraftsByStatus(uid, "DRAFT", 3)))
                .pendingPosts(mapDashboardPosts(dashboardMapper.findUserDraftsByStatus(uid, "PENDING", 3)))
                .rejectedPosts(mapDashboardPosts(dashboardMapper.findUserDraftsByStatus(uid, "REJECTED", 3)))
                .build();
        }
    }

    private List<DashboardResponse.DashboardPost> mapDashboardPosts(
            List<com.blog.admin.model.BlogPostDraft> drafts) {
        return drafts.stream()
            .map(d -> DashboardResponse.DashboardPost.builder()
                .draftId(d.getDraftId()).title(d.getTitle())
                .thumbnailUrl(d.getThumbnailUrl()).updatedAt(d.getUpdatedAt()).build())
            .toList();
    }
}
