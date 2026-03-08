import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe],
  template: `
    <div class="header-row">
      <h2>記事管理</h2>
      <a routerLink="/posts/new" class="btn-primary">新規作成</a>
    </div>
    <div class="filters">
      <select [(ngModel)]="filters.status" (change)="loadPosts()">
        <option value="">全ステータス</option>
        <option value="DRAFT">下書き</option>
        <option value="PENDING">承認待ち</option>
        <option value="APPROVED">承認済み</option>
        <option value="REJECTED">却下</option>
      </select>
      <select [(ngModel)]="filters.category" (change)="loadPosts()">
        <option value="">全カテゴリ</option>
        <option value="TECH">技術</option>
        <option value="DIARY">日記</option>
        <option value="REVIEW">レビュー</option>
      </select>
      <input [(ngModel)]="filters.keyword" placeholder="タイトル検索" (keyup.enter)="loadPosts()" />
      <button (click)="loadPosts()" class="btn-search">検索</button>
    </div>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr><th>タイトル</th><th>カテゴリ</th><th>ステータス</th><th>更新日時</th><th>操作</th></tr>
        </thead>
        <tbody>
          @for (post of posts(); track post.draftId) {
            <tr>
              <td>{{ post.title }}</td>
              <td>{{ post.category }}</td>
              <td><span class="badge" [class]="'badge-' + post.status.toLowerCase()">{{ statusLabel(post.status) }}</span></td>
              <td>{{ post.updatedAt | date:'yyyy/MM/dd HH:mm' }}</td>
              <td>
                <a [routerLink]="['/posts', post.draftId]" class="link">詳細</a>
                @if (post.status === 'DRAFT' || post.status === 'REJECTED') {
                  <a [routerLink]="['/posts/edit', post.draftId]" class="link">編集</a>
                }
                @if (authService.isAdmin() && post.status === 'PENDING') {
                  <a [routerLink]="['/posts/approval', post.draftId]" class="link">承認</a>
                }
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
    <div class="pagination">
      <button (click)="prevPage()" [disabled]="currentPage() <= 1">前へ</button>
      <span>{{ currentPage() }} / {{ totalPages() }}</span>
      <button (click)="nextPage()" [disabled]="currentPage() >= totalPages()">次へ</button>
    </div>
  `,
  styles: [`
    .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .btn-primary { background: #1976d2; color: white; padding: 8px 20px; border-radius: 4px; text-decoration: none; }
    .filters { display: flex; gap: 8px; margin-bottom: 16px; }
    select, input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; }
    .btn-search { background: #1976d2; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
    .table-wrapper { background: white; border-radius: 4px; overflow: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f5f5f5; padding: 12px 16px; text-align: left; font-weight: 500; }
    td { padding: 12px 16px; border-top: 1px solid #eee; }
    .badge { padding: 2px 8px; border-radius: 4px; font-size: 12px; }
    .badge-draft { background: #e3f2fd; color: #1565c0; }
    .badge-pending { background: #fff3e0; color: #e65100; }
    .badge-approved { background: #e8f5e9; color: #2e7d32; }
    .badge-rejected { background: #ffebee; color: #c62828; }
    .link { color: #1976d2; text-decoration: none; margin-right: 8px; }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 16px; }
    .pagination button { padding: 6px 16px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; background: white; }
    .pagination button:disabled { opacity: 0.5; cursor: default; }
  `],
})
export class PostListComponent implements OnInit {
  posts = signal<any[]>([]);
  currentPage = signal(1);
  totalPages = signal(1);
  filters = { status: '', category: '', keyword: '' };

  constructor(public authService: AuthService, private api: ApiService) {}

  ngOnInit() { this.loadPosts(); }

  loadPosts() {
    this.api.getPosts({ ...this.filters, page: this.currentPage(), limit: 20 })
      .subscribe(res => {
        this.posts.set(res.posts);
        this.totalPages.set(Math.ceil(res.pagination.totalItems / res.pagination.itemsPerPage) || 1);
      });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = { DRAFT: '下書き', PENDING: '承認待ち', APPROVED: '承認済み', REJECTED: '却下' };
    return map[status] || status;
  }

  prevPage() { this.currentPage.update(p => p - 1); this.loadPosts(); }
  nextPage() { this.currentPage.update(p => p + 1); this.loadPosts(); }
}
