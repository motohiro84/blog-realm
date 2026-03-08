import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  template: `
    <h2>プロフィール</h2>
    @if (profile(); as p) {
      <div class="form-card">
        <div class="avatar-section">
          @if (p.avatarUrl) { <img [src]="p.avatarUrl" class="avatar" /> }
          @else { <div class="avatar-placeholder">{{ p.firstName?.charAt(0) }}</div> }
          <input type="file" accept="image/*" (change)="onAvatarChange($event)" />
        </div>
        <div class="info"><strong>メール:</strong> {{ p.email }}</div>
        <div class="info"><strong>氏名:</strong> {{ p.lastName }} {{ p.firstName }}</div>
        <div class="form-group">
          <label>表示名</label>
          <input [(ngModel)]="form.displayName" maxlength="50" />
        </div>
        <div class="form-group">
          <label>自己紹介</label>
          <textarea [(ngModel)]="form.bio" rows="4" maxlength="500"></textarea>
        </div>
        <div class="form-group">
          <label><input type="checkbox" [(ngModel)]="form.isPublic" /> プロフィールを公開する</label>
        </div>
        @if (message()) { <div class="success">{{ message() }}</div> }
        <button (click)="save()" class="btn-primary">保存</button>
      </div>
    }
  `,
  styles: [`
    .form-card { background: white; padding: 32px; border-radius: 8px; max-width: 600px; }
    .avatar-section { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; }
    .avatar-placeholder { width: 80px; height: 80px; border-radius: 50%; background: #1976d2; color: white;
                          display: flex; align-items: center; justify-content: center; font-size: 32px; }
    .info { margin-bottom: 12px; color: #555; }
    .form-group { margin-bottom: 16px; }
    label { display: block; margin-bottom: 4px; font-weight: 500; }
    input[type="text"], input:not([type]), textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
    .btn-primary { background: #1976d2; color: white; padding: 10px 24px; border: none; border-radius: 4px; cursor: pointer; }
    .success { background: #e8f5e9; color: #2e7d32; padding: 12px; border-radius: 4px; margin-bottom: 16px; }
  `],
})
export class ProfileComponent implements OnInit {
  profile = signal<any>(null);
  form = { displayName: '', bio: '', isPublic: true, avatarUrl: '' };
  message = signal('');

  constructor(private api: ApiService, private authService: AuthService) {}

  ngOnInit() {
    const userId = this.authService.user()?.userId;
    if (userId) {
      this.api.getProfile(userId).subscribe(p => {
        this.profile.set(p);
        this.form = { displayName: p.displayName || '', bio: p.bio || '', isPublic: p.isPublic, avatarUrl: p.avatarUrl || '' };
      });
    }
  }

  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.api.uploadImages(Array.from(input.files)).subscribe(res => {
      if (res.images.length > 0) this.form.avatarUrl = res.images[0].url;
    });
  }

  save() {
    const userId = this.authService.user()?.userId;
    this.api.updateProfile({ userId, ...this.form }).subscribe(p => {
      this.profile.set(p);
      this.message.set('プロフィールを更新しました');
      setTimeout(() => this.message.set(''), 3000);
    });
  }
}
