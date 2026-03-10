import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="header">
      <h1 class="logo">ブログ管理システム</h1>
      <div class="user-info">
        <span>{{ authService.user()?.profile?.displayName || authService.user()?.username }}</span>
        <button (click)="logout()" class="btn-logout">ログアウト</button>
      </div>
    </header>
  `,
  styles: [`
    .header { display: flex; justify-content: space-between; align-items: center;
              padding: 0 24px; height: 56px; background: #1976d2; color: white; }
    .logo { font-size: 18px; margin: 0; }
    .user-info { display: flex; align-items: center; gap: 16px; }
    .btn-logout { background: rgba(255,255,255,0.2); color: white; border: none;
                  padding: 6px 16px; border-radius: 4px; cursor: pointer; }
    .btn-logout:hover { background: rgba(255,255,255,0.3); }
  `],
})
export class HeaderComponent {
  constructor(public authService: AuthService) {}

  logout() {
    this.authService.logout().subscribe();
  }
}
