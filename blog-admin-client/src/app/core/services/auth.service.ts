import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap } from 'rxjs';
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

  isRefreshing = false;
  refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    if (this.accessToken()) {
      this.loadCurrentUser().pipe(catchError(() => of(void 0))).subscribe();
    }
  }

  getToken(): string | null {
    return this.accessToken();
  }

  login(username: string, password: string): Observable<void> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { username, password }).pipe(
      tap(res => {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
        this.accessToken.set(res.accessToken);
      }),
      switchMap(() => this.loadCurrentUser())
    );
  }

  logout(): Observable<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<void>(`${environment.apiUrl}/auth/logout`, { refreshToken }).pipe(
      catchError(() => of(void 0)),
      tap(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        this.accessToken.set(null);
        this.currentUser.set(null);
        this.router.navigate(['/login']);
      })
    );
  }

  refreshToken(): Observable<string | null> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return of(null);

    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      tap(res => {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
        this.accessToken.set(res.accessToken);
      }),
      map(res => res.accessToken),
      catchError(() => of(null))
    );
  }

  private loadCurrentUser(): Observable<void> {
    return this.http.get<UserInfo>(`${environment.apiUrl}/auth/me`).pipe(
      tap(user => this.currentUser.set(user)),
      map(() => void 0)
    );
  }
}
