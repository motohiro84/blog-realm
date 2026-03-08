package com.blog.admin.controller;

import com.blog.admin.dto.post.*;
import com.blog.admin.model.BlogPostHistory;
import com.blog.admin.model.BlogPostPublished;
import com.blog.admin.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping
    public ResponseEntity<PostListResponse> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(postService.getList(status, category, keyword, userId, startDate, endDate, page, limit));
    }

    @GetMapping("/{draftId}")
    public ResponseEntity<PostDetailResponse> detail(@PathVariable int draftId) {
        return ResponseEntity.ok(postService.getDetail(draftId));
    }

    @PostMapping
    public ResponseEntity<PostDetailResponse> create(@Valid @RequestBody PostCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.create(request));
    }

    @PatchMapping
    public ResponseEntity<PostDetailResponse> update(@Valid @RequestBody PostUpdateRequest request) {
        return ResponseEntity.ok(postService.update(request));
    }

    @DeleteMapping("/{draftId}")
    public ResponseEntity<Void> delete(@PathVariable int draftId) {
        postService.delete(draftId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PostDetailResponse> approve(@Valid @RequestBody PostApproveRequest request) {
        return ResponseEntity.ok(postService.approve(request));
    }

    @PatchMapping("/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PostDetailResponse> reject(@Valid @RequestBody PostRejectRequest request) {
        return ResponseEntity.ok(postService.reject(request));
    }

    @PatchMapping("/unpublish")
    public ResponseEntity<PostDetailResponse> unpublish(@Valid @RequestBody PostUnpublishRequest request) {
        return ResponseEntity.ok(postService.unpublish(request));
    }

    // 公開記事・履歴
    @GetMapping("/published/detail/{postId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BlogPostPublished> publishedDetail(@PathVariable int postId) {
        return ResponseEntity.ok(postService.getPublishedDetail(postId));
    }

    @GetMapping("/history/list/{postId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BlogPostHistory>> historyList(@PathVariable int postId) {
        return ResponseEntity.ok(postService.getHistoryList(postId));
    }

    @GetMapping("/history/detail/{historyId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BlogPostHistory> historyDetail(@PathVariable int historyId) {
        return ResponseEntity.ok(postService.getHistoryDetail(historyId));
    }
}
