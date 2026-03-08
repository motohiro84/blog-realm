import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  {
    path: '',
    loadComponent: () => import('./shared/layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'posts', loadComponent: () => import('./features/posts/post-list/post-list.component').then(m => m.PostListComponent) },
      { path: 'posts/new', loadComponent: () => import('./features/posts/post-form/post-form.component').then(m => m.PostFormComponent) },
      { path: 'posts/edit/:id', loadComponent: () => import('./features/posts/post-form/post-form.component').then(m => m.PostFormComponent) },
      { path: 'posts/:id', loadComponent: () => import('./features/posts/post-detail/post-detail.component').then(m => m.PostDetailComponent) },
      { path: 'posts/approval/:id', loadComponent: () => import('./features/posts/post-approval/post-approval.component').then(m => m.PostApprovalComponent), canActivate: [adminGuard] },
      { path: 'profile', loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'users', loadComponent: () => import('./features/users/user-list/user-list.component').then(m => m.UserListComponent), canActivate: [adminGuard] },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
