import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <h2>ユーザー管理</h2>
    <div class="filters">
      <select [(ngModel)]="filters.role" (change)="loadUsers()">
        <option value="">全ロール</option>
        <option value="USER">一般ユーザー</option>
        <option value="ADMIN">管理者</option>
      </select>
      <input [(ngModel)]="filters.search" placeholder="氏名検索" (keyup.enter)="loadUsers()" />
      <button (click)="loadUsers()" class="btn-search">検索</button>
    </div>
    <div class="table-wrapper">
      <table>
        <thead><tr><th>氏名</th><th>メール</th><th>ロール</th><th>記事数</th><th>登録日</th></tr></thead>
        <tbody>
          @for (user of users(); track user.userId) {
            <tr>
              <td>{{ user.lastName }} {{ user.firstName }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.role === 'ADMIN' ? '管理者' : '一般' }}</td>
              <td>{{ user.postCount }}</td>
              <td>{{ user.createdAt | date:'yyyy/MM/dd' }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .filters { display: flex; gap: 8px; margin-bottom: 16px; }
    select, input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; }
    .btn-search { background: #1976d2; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
    .table-wrapper { background: white; border-radius: 4px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f5f5f5; padding: 12px 16px; text-align: left; }
    td { padding: 12px 16px; border-top: 1px solid #eee; }
  `],
})
export class UserListComponent implements OnInit {
  users = signal<any[]>([]);
  filters = { role: '', search: '' };

  constructor(private api: ApiService) {}

  ngOnInit() { this.loadUsers(); }

  loadUsers() {
    this.api.getUsers({ ...this.filters, page: 1, limit: 50 }).subscribe(res => this.users.set(res.users));
  }
}
