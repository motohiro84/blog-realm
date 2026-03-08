package com.blog.admin.service;

import com.blog.admin.dto.post.*;
import com.blog.admin.dto.common.PaginationInfo;
import com.blog.admin.exception.BusinessException;
import com.blog.admin.exception.ErrorCode;
import com.blog.admin.mapper.*;
import com.blog.admin.model.*;
import com.blog.admin.util.SecurityUtils;
import com.blog.admin.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostDraftMapper draftMapper;
    private final PostPublishedMapper publishedMapper;
    private final PostHistoryMapper historyMapper;
    private final ImageDraftMapper imageDraftMapper;
    private final ImagePublishedMapper imagePublishedMapper;
    private final UserMapper userMapper;
    private final SearchSyncService searchSyncService;

    public PostListResponse getList(String status, String category, String keyword,
                                    Integer userId, String startDate, String endDate,
                                    int page, int limit) {
        User currentUser = getCurrentUser();
        Integer authorId = SecurityUtils.isAdmin() ? userId : currentUser.getUserId();

        PostSearchCondition cond = PostSearchCondition.builder()
            .status(status).category(category).keyword(keyword).authorId(authorId)
            .startDate(startDate).endDate(endDate)
            .limit(limit).offset((page - 1) * limit)
            .build();

        List<BlogPostDraft> drafts = draftMapper.findByCondition(cond);
        int total = draftMapper.countByCondition(cond);

        List<PostListResponse.PostSummary> summaries = drafts.stream()
            .map(d -> PostListResponse.PostSummary.builder()
                .draftId(d.getDraftId()).title(d.getTitle()).category(d.getCategory())
                .status(d.getStatus()).thumbnailUrl(d.getThumbnailUrl())
                .authorId(d.getAuthorId()).authorName(d.getAuthorName())
                .createdAt(d.getCreatedAt()).updatedAt(d.getUpdatedAt())
                .build())
            .toList();

        return PostListResponse.builder()
            .posts(summaries)
            .pagination(new PaginationInfo(page, total, limit))
            .build();
    }

    public PostDetailResponse getDetail(int draftId) {
        BlogPostDraft draft = draftMapper.findByIdWithDetail(draftId);
        if (draft == null) throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        checkAccess(draft);

        List<BlogImageDraft> images = imageDraftMapper.findByDraftId(draftId);
        String thumbnailUrl = images.stream()
            .filter(BlogImageDraft::getIsThumbnail).findFirst()
            .map(BlogImageDraft::getImageUrl).orElse(null);

        return PostDetailResponse.builder()
            .draftId(draft.getDraftId()).title(draft.getTitle()).content(draft.getContent())
            .category(draft.getCategory()).status(draft.getStatus())
            .thumbnailUrl(thumbnailUrl).isPublic(false)
            .publishedPostId(draft.getPublishedPostId())
            .authorId(draft.getAuthorId()).authorName(draft.getAuthorName())
            .createdAt(draft.getCreatedAt()).updatedAt(draft.getUpdatedAt())
            .approvedAt(draft.getApprovedAt()).approvedById(draft.getApprovedById())
            .approvedByName(draft.getApprovedByName())
            .rejectedAt(draft.getRejectedAt()).rejectedById(draft.getRejectedById())
            .rejectedByName(draft.getRejectedByName())
            .rejectionReason(draft.getRejectionReason())
            .images(images.stream().map(i -> PostDetailResponse.ImageItem.builder()
                .imageId(i.getImageId()).imageUrl(i.getImageUrl()).isThumbnail(i.getIsThumbnail())
                .build()).toList())
            .build();
    }

    @Transactional
    public PostDetailResponse create(PostCreateRequest req) {
        User currentUser = getCurrentUser();

        BlogPostDraft draft = new BlogPostDraft();
        draft.setAuthorId(currentUser.getUserId());
        draft.setTitle(req.getTitle());
        draft.setContent(req.getContent());
        draft.setCategory(req.getCategory());
        draft.setStatus(req.getSubmit() ? "PENDING" : "DRAFT");
        if (req.getSubmit()) draft.setSubmittedAt(LocalDateTime.now());
        draftMapper.insert(draft);

        if (req.getImages() != null && !req.getImages().isEmpty()) {
            saveImages(draft.getDraftId(), req.getImages());
        }

        return getDetail(draft.getDraftId());
    }

    @Transactional
    public PostDetailResponse update(PostUpdateRequest req) {
        BlogPostDraft draft = draftMapper.findById(req.getDraftId());
        if (draft == null) throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        checkAccess(draft);
        if ("PENDING".equals(draft.getStatus())) throw new BusinessException(ErrorCode.POST_NOT_EDITABLE);

        if (req.getTitle() != null) draft.setTitle(req.getTitle());
        if (req.getContent() != null) draft.setContent(req.getContent());
        if (req.getCategory() != null) draft.setCategory(req.getCategory());
        draft.setStatus(req.getSubmit() ? "PENDING" : "DRAFT");
        if (req.getSubmit()) draft.setSubmittedAt(LocalDateTime.now());
        // 却下からの再申請時はリセット
        draft.setRejectionReason(null);
        draft.setRejectedAt(null);
        draft.setRejectedById(null);
        draftMapper.update(draft);

        if (req.getImages() != null) {
            imageDraftMapper.softDeleteByDraftId(req.getDraftId());
            if (!req.getImages().isEmpty()) {
                saveImages(req.getDraftId(), req.getImages());
            }
        }

        return getDetail(req.getDraftId());
    }

    @Transactional
    public void delete(int draftId) {
        BlogPostDraft draft = draftMapper.findById(draftId);
        if (draft == null) throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        checkAccess(draft);

        if (!SecurityUtils.isAdmin()) {
            if (!"DRAFT".equals(draft.getStatus()) || draft.getPublishedPostId() != null) {
                throw new BusinessException(ErrorCode.POST_NOT_DELETABLE);
            }
        }

        draftMapper.softDelete(draftId);
        imageDraftMapper.softDeleteByDraftId(draftId);

        // 管理者の場合、公開記事も連動削除
        if (SecurityUtils.isAdmin() && draft.getPublishedPostId() != null) {
            publishedMapper.softDelete(draft.getPublishedPostId());
            imagePublishedMapper.softDeleteByPostId(draft.getPublishedPostId());
            searchSyncService.deleteFromSearch(draft.getPublishedPostId());
        }
    }

    @Transactional
    public PostDetailResponse approve(PostApproveRequest req) {
        BlogPostDraft draft = draftMapper.findByIdWithDetail(req.getDraftId());
        if (draft == null) throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        if (!"PENDING".equals(draft.getStatus())) throw new BusinessException(ErrorCode.POST_NOT_APPROVABLE);

        User admin = getCurrentUser();
        LocalDateTime now = LocalDateTime.now();

        // Draft更新
        draft.setStatus("APPROVED");
        draft.setApprovedAt(now);
        draft.setApprovedById(admin.getUserId());
        draftMapper.update(draft);

        List<BlogImageDraft> draftImages = imageDraftMapper.findByDraftId(req.getDraftId());
        String thumbnailUrl = draftImages.stream()
            .filter(BlogImageDraft::getIsThumbnail).findFirst()
            .map(BlogImageDraft::getImageUrl).orElse(null);

        int publishedPostId;

        if (draft.getPublishedPostId() == null) {
            // 新規公開
            BlogPostPublished pub = new BlogPostPublished();
            pub.setAuthorId(draft.getAuthorId());
            pub.setTitle(draft.getTitle());
            pub.setContent(draft.getContent());
            pub.setCategory(draft.getCategory());
            pub.setApprovedAt(now);
            pub.setApprovedById(admin.getUserId());
            // Slug生成
            String baseSlug = SlugUtils.generateSlug(draft.getTitle(), 0);
            String slug = baseSlug;
            int suffix = 2;
            while (publishedMapper.existsBySlug(slug)) {
                slug = baseSlug + "-" + suffix++;
            }
            pub.setSlug(slug);
            publishedMapper.insert(pub);
            publishedPostId = pub.getPostId();

            // DraftにpublishedPostId設定
            draft.setPublishedPostId(publishedPostId);
            draftMapper.update(draft);
        } else {
            // 更新（既存を履歴に退避）
            publishedPostId = draft.getPublishedPostId();
            BlogPostPublished existing = publishedMapper.findById(publishedPostId);

            int maxVersion = publishedMapper.getMaxVersion(publishedPostId);
            BlogPostHistory history = new BlogPostHistory();
            history.setPostId(publishedPostId);
            history.setVersion(maxVersion + 1);
            history.setTitle(existing.getTitle());
            history.setContent(existing.getContent());
            history.setCategory(existing.getCategory());
            history.setThumbnailUrl(thumbnailUrl);
            history.setApprovedAt(existing.getApprovedAt());
            history.setApprovedById(existing.getApprovedById());
            historyMapper.insert(history);

            // 公開記事を更新
            existing.setTitle(draft.getTitle());
            existing.setContent(draft.getContent());
            existing.setCategory(draft.getCategory());
            existing.setApprovedAt(now);
            existing.setApprovedById(admin.getUserId());
            publishedMapper.update(existing);
        }

        // 画像コピー
        imagePublishedMapper.softDeleteByPostId(publishedPostId);
        if (!draftImages.isEmpty()) {
            List<BlogImagePublished> pubImages = draftImages.stream().map(di -> {
                BlogImagePublished pi = new BlogImagePublished();
                pi.setPostId(publishedPostId);
                pi.setImageUrl(di.getImageUrl());
                pi.setIsThumbnail(di.getIsThumbnail());
                pi.setDisplayOrder(di.getDisplayOrder());
                return pi;
            }).toList();
            imagePublishedMapper.insertBatch(pubImages);
        }

        // Elasticsearch同期
        searchSyncService.syncToSearch(publishedPostId);

        return getDetail(req.getDraftId());
    }

    @Transactional
    public PostDetailResponse reject(PostRejectRequest req) {
        BlogPostDraft draft = draftMapper.findById(req.getDraftId());
        if (draft == null) throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        if (!"PENDING".equals(draft.getStatus())) throw new BusinessException(ErrorCode.POST_NOT_REJECTABLE);

        User admin = getCurrentUser();
        draft.setStatus("REJECTED");
        draft.setRejectedAt(LocalDateTime.now());
        draft.setRejectedById(admin.getUserId());
        draft.setRejectionReason(req.getRejectionReason());
        draftMapper.update(draft);

        return getDetail(req.getDraftId());
    }

    @Transactional
    public PostDetailResponse unpublish(PostUnpublishRequest req) {
        BlogPostDraft draft = draftMapper.findById(req.getDraftId());
        if (draft == null) throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        checkAccess(draft);
        if (draft.getPublishedPostId() == null) throw new BusinessException(ErrorCode.POST_NOT_UNPUBLISHABLE);

        BlogPostPublished pub = publishedMapper.findById(draft.getPublishedPostId());
        if (pub == null || !pub.getIsPublic()) throw new BusinessException(ErrorCode.POST_NOT_UNPUBLISHABLE);

        publishedMapper.setUnpublished(draft.getPublishedPostId());
        searchSyncService.deleteFromSearch(draft.getPublishedPostId());

        return getDetail(req.getDraftId());
    }

    // 公開記事・履歴
    public BlogPostPublished getPublishedDetail(int postId) {
        BlogPostPublished pub = publishedMapper.findByIdWithDetail(postId);
        if (pub == null) throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        return pub;
    }

    public List<BlogPostHistory> getHistoryList(int postId) {
        return historyMapper.findByPostId(postId);
    }

    public BlogPostHistory getHistoryDetail(int historyId) {
        BlogPostHistory h = historyMapper.findById(historyId);
        if (h == null) throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        return h;
    }

    // ヘルパー
    private User getCurrentUser() {
        String keycloakId = SecurityUtils.getCurrentKeycloakId();
        User user = userMapper.findByKeycloakId(keycloakId);
        if (user == null) throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        return user;
    }

    private void checkAccess(BlogPostDraft draft) {
        if (!SecurityUtils.isAdmin()) {
            User current = getCurrentUser();
            if (!draft.getAuthorId().equals(current.getUserId())) {
                throw new BusinessException(ErrorCode.FORBIDDEN);
            }
        }
    }

    private void saveImages(int draftId, List<ImageInfo> images) {
        List<BlogImageDraft> entities = new java.util.ArrayList<>();
        for (int i = 0; i < images.size(); i++) {
            BlogImageDraft img = new BlogImageDraft();
            img.setDraftId(draftId);
            img.setImageUrl(images.get(i).getUrl());
            img.setIsThumbnail(images.get(i).getIsThumbnail() != null && images.get(i).getIsThumbnail());
            img.setDisplayOrder(i);
            entities.add(img);
        }
        imageDraftMapper.insertBatch(entities);
    }
}
