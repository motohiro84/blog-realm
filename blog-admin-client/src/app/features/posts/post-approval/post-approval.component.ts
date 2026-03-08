import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-post-approval',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe],
  template: `
    @if (post(); as p) {
      <div class="detail-card">
        <h2>記事承認 - {{ p.title }}</h2>
        <div class="meta">
          <span>著者: {{ p.authorName }}</span>
          <span>カテゴリ: {{ p.category }}</span>
          <span>申請日: {{ p.updatedAt | date:'yyyy/MM/dd HH:mm' }}</span>
        </div>
        <div class="content" [innerHTML]="p.content"></div>
        <div class="approval-section">
          <h3>承認/却下</h3>
          <div class="form-group">
            <label>却下理由（却下時のみ）</label>
            <textarea [(ngModel)]="rejectionReason" rows="3" placeholder="却下理由を入力..."></textarea>
          </div>
          <div class="actions">
            <button (click)="approve()" class="btn-approve">承認する</button>
            <button (click)="reject()" class="btn-reject" [disabled]="!rejectionReason">却下する</button>
            <a routerLink="/posts" class="btn-text">戻る</a>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .detail-card { background: white; padding: 32px; border-radius: 8px; max-width: 900px; }
    .meta { display: flex; gap: 16px; color: #666; margin-bottom: 16px; }
    .content { border-top: 1px solid #eee; padding: 24px 0; line-height: 1.8; max-height: 400px; overflow-y: auto; }
    .approval-section { border-top: 2px solid #1976d2; padding-top: 24px; margin-top: 16px; }
    .form-group { margin-bottom: 16px; }
    label { display: block; margin-bottom: 4px; font-weight: 500; }
    textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
    .actions { display: flex; gap: 12px; }
    .btn-approve { background: #2e7d32; color: white; padding: 10px 24px; border: none; border-radius: 4px; cursor: pointer; }
    .btn-reject { background: #d32f2f; color: white; padding: 10px 24px; border: none; border-radius: 4px; cursor: pointer; }
    .btn-reject:disabled { opacity: 0.5; }
    .btn-text { color: #666; text-decoration: none; padding: 10px; }
  `],
})
export class PostApprovalComponent implements OnInit {
  post = signal<any>(null);
  rejectionReason = '';

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.api.getPost(id).subscribe(p => this.post.set(p));
  }

  approve() {
    if (!confirm('この記事を承認しますか？')) return;
    this.api.approvePost(this.post().draftId).subscribe(() => {
      alert('記事を承認しました');
      this.router.navigate(['/dashboard']);
    });
  }

  reject() {
    if (!confirm('この記事を却下しますか？')) return;
    this.api.rejectPost(this.post().draftId, this.rejectionReason).subscribe(() => {
      alert('記事を却下しました');
      this.router.navigate(['/dashboard']);
    });
  }
}
