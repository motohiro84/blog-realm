import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>ブログ管理システム</h2>
        @if (errorMessage()) { <div class="error">{{ errorMessage() }}</div> }
        <div class="form-group">
          <label>ユーザー名</label>
          <input [(ngModel)]="username" placeholder="user@example.com" (keyup.enter)="login()" />
        </div>
        <div class="form-group">
          <label>パスワード</label>
          <input type="password" [(ngModel)]="password" placeholder="パスワード" (keyup.enter)="login()" />
        </div>
        <button (click)="login()" [disabled]="loading()" class="btn-login">
          {{ loading() ? 'ログイン中...' : 'ログイン' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .login-container { display: flex; justify-content: center; align-items: center; height: 100vh; background: #f5f5f5; }
    .login-card { background: white; padding: 48px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); width: 400px; }
    h2 { text-align: center; margin-bottom: 32px; color: #1976d2; }
    .form-group { margin-bottom: 16px; }
    label { display: block; margin-bottom: 4px; font-weight: 500; color: #555; }
    input { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; box-sizing: border-box; }
    .btn-login { width: 100%; padding: 12px; background: #1976d2; color: white; border: none;
                 border-radius: 4px; font-size: 16px; cursor: pointer; margin-top: 8px; }
    .btn-login:hover { background: #1565c0; }
    .btn-login:disabled { background: #90caf9; }
    .error { background: #ffebee; color: #c62828; padding: 12px; border-radius: 4px; margin-bottom: 16px; }
  `],
})
export class LoginComponent {
  username = '';
  password = '';
  loading = signal(false);
  errorMessage = signal('');

  constructor(private authService: AuthService, private router: Router) {}

  async login() {
    if (!this.username || !this.password) {
      this.errorMessage.set('ユーザー名とパスワードを入力してください');
      return;
    }
    this.loading.set(true);
    this.errorMessage.set('');
    try {
      await this.authService.login(this.username, this.password);
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.errorMessage.set('ユーザー名またはパスワードが正しくありません');
    } finally {
      this.loading.set(false);
    }
  }
}
