import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: { id: number; username: string; roles: string[] };
}

interface UserInfo {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  profile: { displayName: string; avatarUrl: string | null; bio: string | null; isPublic: boolean };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = signal<UserInfo | null>(null);
  private accessToken = signal<string | null>(localStorage.getItem('accessToken'));

  user = this.currentUser.asReadonly();
  isLoggedIn = computed(() => !!this.accessToken());
  isAdmin = computed(() => this.currentUser()?.roles.includes('admin') ?? false);

  constructor(private http: HttpClient, private router: Router) {
    if (this.accessToken()) {
      this.loadCurrentUser();
    }
  }

  getToken(): string | null {
    return this.accessToken();
  }

  async login(username: string, password: string): Promise<void> {
    const res = await this.http.post<LoginResponse>(
      `${environment.apiUrl}/auth/login`, { username, password }
    ).toPromise();

    if (res) {
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken);
      this.accessToken.set(res.accessToken);
      await this.loadCurrentUser();
    }
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await this.http.post(`${environment.apiUrl}/auth/logout`, { refreshToken }).toPromise();
    } catch (e) {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.accessToken.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  async refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    try {
      const res = await this.http.post<LoginResponse>(
        `${environment.apiUrl}/auth/refresh`, { refreshToken }
      ).toPromise();
      if (res) {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
        this.accessToken.set(res.accessToken);
        return res.accessToken;
      }
    } catch (e) {
      await this.logout();
    }
    return null;
  }

  private async loadCurrentUser(): Promise<void> {
    try {
      const user = await this.http.get<UserInfo>(`${environment.apiUrl}/auth/me`).toPromise();
      if (user) this.currentUser.set(user);
    } catch (e) {
      await this.logout();
    }
  }
}
