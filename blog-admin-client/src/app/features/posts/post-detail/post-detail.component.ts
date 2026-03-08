import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    @if (post(); as p) {
      <div class="detail-card">
        <div class="header-row">
          <h2>{{ p.title }}</h2>
          <span class="badge" [class]="'badge-' + p.status.toLowerCase()">{{ statusLabel(p.status) }}</span>
        </div>
        <div class="meta">
          <span>カテゴリ: {{ p.category }}</span>
          <span>著者: {{ p.authorName }}</span>
          <span>作成: {{ p.createdAt | date:'yyyy/MM/dd HH:mm' }}</span>
          <span>更新: {{ p.updatedAt | date:'yyyy/MM/dd HH:mm' }}</span>
        </div>
        @if (p.rejectionReason) {
          <div class="rejection">却下理由: {{ p.rejectionReason }}</div>
        }
        <div class="content" [innerHTML]="p.content"></div>
        <div class="actions">
          @if (p.status === 'DRAFT' || p.status === 'REJECTED') {
            <a [routerLink]="['/posts/edit', p.draftId]" class="btn-primary">編集</a>
          }
          @if (p.status === 'DRAFT') {
            <button (click)="deletePost()" class="btn-danger">削除</button>
          }
          @if (p.publishedPostId && authService.isAdmin()) {
            <button (click)="unpublish()" class="btn-secondary">非公開にする</button>
          }
          <a routerLink="/posts" class="btn-text">一覧に戻る</a>
        </div>
      </div>
    }
  `,
  styles: [`
    .detail-card { background: white; padding: 32px; border-radius: 8px; max-width: 900px; }
    .header-row { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
    h2 { margin: 0; }
    .badge { padding: 4px 12px; border-radius: 4px; font-size: 12px; }
    .badge-draft { background: #e3f2fd; color: #1565c0; }
    .badge-pending { background: #fff3e0; color: #e65100; }
    .badge-approved { background: #e8f5e9; color: #2e7d32; }
    .badge-rejected { background: #ffebee; color: #c62828; }
    .meta { display: flex; gap: 16px; color: #666; font-size: 14px; margin-bottom: 16px; }
    .rejection { background: #ffebee; color: #c62828; padding: 12px; border-radius: 4px; margin-bottom: 16px; }
    .content { border-top: 1px solid #eee; padding-top: 24px; line-height: 1.8; }
    .actions { display: flex; gap: 12px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; }
    .btn-primary { background: #1976d2; color: white; padding: 8px 20px; border-radius: 4px; text-decoration: none; border: none; cursor: pointer; }
    .btn-secondary { background: #757575; color: white; padding: 8px 20px; border-radius: 4px; border: none; cursor: pointer; }
    .btn-danger { background: #d32f2f; color: white; padding: 8px 20px; border-radius: 4px; border: none; cursor: pointer; }
    .btn-text { color: #666; text-decoration: none; padding: 8px; }
  `],
})
export class PostDetailComponent implements OnInit {
  post = signal<any>(null);

  constructor(public authService: AuthService, private api: ApiService,
              private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.api.getPost(id).subscribe(p => this.post.set(p));
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = { DRAFT: '下書き', PENDING: '承認待ち', APPROVED: '承認済み', REJECTED: '却下' };
    return map[status] || status;
  }

  deletePost() {
    if (!confirm('この記事を削除しますか？')) return;
    this.api.deletePost(this.post().draftId).subscribe(() => this.router.navigate(['/posts']));
  }

  unpublish() {
    if (!confirm('この記事を非公開にしますか？')) return;
    this.api.unpublishPost(this.post().draftId).subscribe(p => this.post.set(p));
  }
}
