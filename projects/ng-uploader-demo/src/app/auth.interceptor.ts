import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';

import { throwError, of, Observable, BehaviorSubject, iif } from 'rxjs';
import {
  catchError,
  switchMap,
  filter,
  take,
  retryWhen,
  delay,
  concatMap
} from 'rxjs/operators';

import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor, OnDestroy {
  private isRefreshingAccessToken: boolean;
  private refreshAccessTokenSubject: BehaviorSubject<string>;

  constructor(private authService: AuthService) {
    this.refreshAccessTokenSubject = new BehaviorSubject(null);
  }

  ngOnDestroy(): void {
    this.refreshAccessTokenSubject.complete();
  }

  private addAccessTokenToHeaders(req: HttpRequest<any>): HttpRequest<any> {
    const accessToken = this.authService.getAccessToken();
    const authReq = req.clone({
      headers: req.headers.set(
        'Authorization',
        accessToken ? `Bearer ${accessToken}` : ''
      )
    });
    return authReq;
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(this.addAccessTokenToHeaders(req)).pipe(
      catchError((err: HttpErrorResponse) => {
        if (
          err.status !== 401 ||
          req.url.includes('login') ||
          req.url.includes('refresh')
        ) {
          return throwError(err);
        }
        if (this.isRefreshingAccessToken) {
          return this.refreshAccessTokenSubject.pipe(
            filter(accessToken => accessToken !== null),
            take(1),
            switchMap(() => next.handle(this.addAccessTokenToHeaders(req)))
          );
        }
        this.isRefreshingAccessToken = true;
        this.refreshAccessTokenSubject.next(null);
        return this.authService.refreshAccessToken().pipe(
          retryWhen(errors =>
            errors.pipe(
              concatMap((e, i) =>
                iif(() => i > 5, throwError(e), of(e).pipe(delay(500)))
              )
            )
          ),
          switchMap((res: any) => {
            const accessToken = res.access;
            this.authService.setAccessToken(accessToken);
            this.refreshAccessTokenSubject.next(accessToken);
            this.isRefreshingAccessToken = false;
            return next.handle(this.addAccessTokenToHeaders(req));
          }),
          catchError((_err: HttpErrorResponse) => {
            this.isRefreshingAccessToken = false;
            return of(null);
          })
        );
      })
    );
  }
}
