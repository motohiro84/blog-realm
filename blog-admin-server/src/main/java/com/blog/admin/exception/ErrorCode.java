package com.blog.admin.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // 認証
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "ユーザー名またはパスワードが正しくありません"),
    INVALID_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, "リフレッシュトークンが無効です"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "認証が必要です"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "権限がありません"),

    // バリデーション
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "入力内容に誤りがあります"),

    // リソース
    POST_NOT_FOUND(HttpStatus.NOT_FOUND, "記事が見つかりません"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "ユーザーが見つかりません"),
    MASTER_CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "指定されたマスタカテゴリが見つかりません"),

    // 競合
    POST_NOT_EDITABLE(HttpStatus.CONFLICT, "申請中の記事は編集できません"),
    POST_NOT_DELETABLE(HttpStatus.CONFLICT, "この記事は削除できません"),
    POST_NOT_APPROVABLE(HttpStatus.CONFLICT, "申請中の記事のみ承認できます"),
    POST_NOT_REJECTABLE(HttpStatus.CONFLICT, "申請中の記事のみ却下できます"),
    POST_NOT_UNPUBLISHABLE(HttpStatus.CONFLICT, "公開中の記事のみ非公開にできます"),

    // サーバーエラー
    IMAGE_UPLOAD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "画像のアップロードに失敗しました"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "内部エラーが発生しました");

    private final HttpStatus status;
    private final String message;
}
