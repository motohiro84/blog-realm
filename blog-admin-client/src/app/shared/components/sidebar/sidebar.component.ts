import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="sidebar">
      <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">ダッシュボード</a>
      <a routerLink="/posts" routerLinkActive="active" class="nav-item">記事管理</a>
      <a routerLink="/profile" routerLinkActive="active" class="nav-item">プロフィール</a>
      @if (authService.isAdmin()) {
        <a routerLink="/users" routerLinkActive="active" class="nav-item">ユーザー管理</a>
      }
    </nav>
  `,
  styles: [`
    .sidebar { width: 220px; background: #263238; padding: 16px 0; }
    .nav-item { display: block; padding: 12px 24px; color: #b0bec5; text-decoration: none; }
    .nav-item:hover { background: rgba(255,255,255,0.05); color: white; }
    .nav-item.active { background: rgba(255,255,255,0.1); color: white; border-left: 3px solid #42a5f5; }
  `],
})
export class SidebarComponent {
  constructor(public authService: AuthService) {}
}
