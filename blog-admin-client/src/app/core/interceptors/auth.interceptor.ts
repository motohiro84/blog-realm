import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, filter, switchMap, take, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // ログイン・リフレッシュ・ログアウトはトークン不要
  if (req.url.includes('/auth/login') || req.url.includes('/auth/refresh') || req.url.includes('/auth/logout')) {
    return next(req);
  }

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      if (!authService.isRefreshing) {
        authService.isRefreshing = true;
        authService.refreshTokenSubject.next(null);

        return authService.refreshToken().pipe(
          switchMap((newToken) => {
            authService.isRefreshing = false;
            if (newToken) {
              authService.refreshTokenSubject.next(newToken);
              return next(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }));
            }
            authService.logout().subscribe();
            return throwError(() => error);
          }),
          catchError((err) => {
            authService.isRefreshing = false;
            authService.logout().subscribe();
            return throwError(() => err);
          })
        );
      }

      // リフレッシュ中 → 新トークンが届くまで待機してリトライ
      return authService.refreshTokenSubject.pipe(
        filter(t => t !== null),
        take(1),
        switchMap(t => next(req.clone({ setHeaders: { Authorization: `Bearer ${t}` } })))
      );
    })
  );
};
