import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <h2>{{ isEdit() ? '記事編集' : '記事作成' }}</h2>
    <div class="form-card">
      <div class="form-group">
        <label>タイトル</label>
        <input [(ngModel)]="form.title" maxlength="200" />
      </div>
      <div class="form-group">
        <label>カテゴリ</label>
        <select [(ngModel)]="form.category">
          <option value="">選択してください</option>
          <option value="TECH">技術</option>
          <option value="DIARY">日記</option>
          <option value="REVIEW">レビュー</option>
        </select>
      </div>
      <div class="form-group">
        <label>本文（HTML）</label>
        <textarea [(ngModel)]="form.content" rows="20"></textarea>
      </div>
      <div class="form-group">
        <label>画像アップロード</label>
        <input type="file" multiple accept="image/*" (change)="onFilesSelected($event)" />
        @for (img of uploadedImages(); track img.url) {
          <div class="image-preview">
            <img [src]="img.url" width="80" />
            <label><input type="radio" name="thumbnail" [value]="img.url" [(ngModel)]="thumbnailUrl" /> サムネイル</label>
          </div>
        }
      </div>
      @if (errorMessage()) { <div class="error">{{ errorMessage() }}</div> }
      <div class="actions">
        <button (click)="save(false)" class="btn-secondary">下書き保存</button>
        <button (click)="save(true)" class="btn-primary">申請する</button>
        <button (click)="cancel()" class="btn-text">キャンセル</button>
      </div>
    </div>
  `,
  styles: [`
    .form-card { background: white; padding: 32px; border-radius: 8px; max-width: 800px; }
    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 4px; font-weight: 500; }
    input, select, textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; font-size: 14px; }
    textarea { font-family: monospace; }
    .image-preview { display: inline-flex; align-items: center; gap: 8px; margin: 8px 8px 0 0; padding: 8px; background: #f5f5f5; border-radius: 4px; }
    .actions { display: flex; gap: 12px; margin-top: 24px; }
    .btn-primary { background: #1976d2; color: white; padding: 10px 24px; border: none; border-radius: 4px; cursor: pointer; }
    .btn-secondary { background: #757575; color: white; padding: 10px 24px; border: none; border-radius: 4px; cursor: pointer; }
    .btn-text { background: none; border: none; color: #666; cursor: pointer; padding: 10px; }
    .error { background: #ffebee; color: #c62828; padding: 12px; border-radius: 4px; margin-bottom: 16px; }
  `],
})
export class PostFormComponent implements OnInit {
  isEdit = signal(false);
  form = { title: '', content: '', category: '', draftId: 0 };
  uploadedImages = signal<{ url: string }[]>([]);
  thumbnailUrl = '';
  errorMessage = signal('');

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.api.getPost(+id).subscribe(post => {
        this.form = { title: post.title, content: post.content, category: post.category, draftId: post.draftId };
        if (post.images) {
          this.uploadedImages.set(post.images.map((i: any) => ({ url: i.imageUrl })));
          const thumb = post.images.find((i: any) => i.isThumbnail);
          if (thumb) this.thumbnailUrl = thumb.imageUrl;
        }
      });
    }
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.api.uploadImages(Array.from(input.files)).subscribe(res => {
      this.uploadedImages.update(imgs => [...imgs, ...res.images]);
    });
  }

  save(submit: boolean) {
    if (!this.form.title || !this.form.content || !this.form.category) {
      this.errorMessage.set('タイトル、カテゴリ、本文は必須です');
      return;
    }

    const images = this.uploadedImages().map(img => ({
      url: img.url,
      isThumbnail: img.url === this.thumbnailUrl,
    }));

    const data = { ...this.form, submit, images };

    const req$ = this.isEdit() ? this.api.updatePost(data) : this.api.createPost(data);
    req$.subscribe({
      next: (res) => this.router.navigate(['/posts', res.draftId]),
      error: (err) => this.errorMessage.set(err.error?.error?.message || 'エラーが発生しました'),
    });
  }

  cancel() { this.router.navigate(['/posts']); }
}
