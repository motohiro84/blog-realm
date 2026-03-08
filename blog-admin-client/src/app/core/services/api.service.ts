import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ダッシュボード
  getDashboard(): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard`);
  }

  // 記事一覧
  getPosts(params: any): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.set(key, params[key]);
      }
    });
    return this.http.get(`${this.baseUrl}/posts`, { params: httpParams });
  }

  // 記事詳細
  getPost(draftId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/posts/${draftId}`);
  }

  // 記事作成
  createPost(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/posts`, data);
  }

  // 記事更新
  updatePost(data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/posts`, data);
  }

  // 記事削除
  deletePost(draftId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/posts/${draftId}`);
  }

  // 記事承認
  approvePost(draftId: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/posts/approve`, { draftId });
  }

  // 記事却下
  rejectPost(draftId: number, rejectionReason: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/posts/reject`, { draftId, rejectionReason });
  }

  // 非公開
  unpublishPost(draftId: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/posts/unpublish`, { draftId });
  }

  // 公開記事詳細
  getPublishedDetail(postId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/posts/published/detail/${postId}`);
  }

  // 公開履歴
  getHistoryList(postId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/posts/history/list/${postId}`);
  }

  getHistoryDetail(historyId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/posts/history/detail/${historyId}`);
  }

  // 画像アップロード
  uploadImages(files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    return this.http.post(`${this.baseUrl}/images`, formData);
  }

  // プロフィール
  getProfile(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/profile/${userId}`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/users/profile`, data);
  }

  // ユーザー一覧
  getUsers(params: any): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] != null && params[key] !== '') httpParams = httpParams.set(key, params[key]);
    });
    return this.http.get(`${this.baseUrl}/users`, { params: httpParams });
  }

  // マスタ
  getMasters(category: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/masters/list`, { category });
  }
}
