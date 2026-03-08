import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <h2>ダッシュボード</h2>
    @if (authService.isAdmin()) {
      <div class="section">
        <h3>承認待ち記事</h3>
        @for (post of data()?.awaitingApprovalPosts; track post.draftId) {
          <div class="card">
            <a [routerLink]="['/posts/approval', post.draftId]" class="card-link">
              <strong>{{ post.title }}</strong>
              <span class="meta">{{ post.authorName }} - {{ post.updatedAt | date:'yyyy/MM/dd HH:mm' }}</span>
            </a>
          </div>
        }
        @empty { <p class="empty">承認待ちの記事はありません</p> }
      </div>
    } @else {
      @for (section of [
        { key: 'draftPosts', title: '下書き' },
        { key: 'pendingPosts', title: '承認待ち' },
        { key: 'rejectedPosts', title: '却下' }
      ]; track section.key) {
        <div class="section">
          <h3>{{ section.title }}</h3>
          @for (post of data()?.[section.key]; track post.draftId) {
            <div class="card">
              <a [routerLink]="['/posts', post.draftId]" class="card-link">
                <strong>{{ post.title }}</strong>
                <span class="meta">{{ post.updatedAt | date:'yyyy/MM/dd HH:mm' }}</span>
              </a>
            </div>
          }
          @empty { <p class="empty">{{ section.title }}の記事はありません</p> }
        </div>
      }
    }
  `,
  styles: [`
    h2 { margin-bottom: 24px; }
    .section { margin-bottom: 32px; }
    h3 { margin-bottom: 12px; color: #555; }
    .card { background: white; padding: 16px; margin-bottom: 8px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .card-link { text-decoration: none; color: inherit; display: block; }
    .card-link:hover strong { color: #1976d2; }
    .meta { display: block; font-size: 12px; color: #888; margin-top: 4px; }
    .empty { color: #888; font-style: italic; }
  `],
})
export class DashboardComponent implements OnInit {
  data = signal<any>(null);

  constructor(public authService: AuthService, private api: ApiService) {}

  ngOnInit() {
    this.api.getDashboard().subscribe(res => this.data.set(res));
  }
}
