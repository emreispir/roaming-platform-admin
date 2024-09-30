import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, from, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { MsalService } from '@azure/msal-angular';
import { Keys } from './@core/constants/keys';
import { SharedService } from './@core/services/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { loginRequest } from '../auth-config';
import { NotificationService } from './@core/services/notification.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private refreshingToken = false;
  private tokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<
    string | null
  >(null);

  constructor(
    private msalService: MsalService,
    private sharedService: SharedService,
    protected translateService: TranslateService,
    protected notificationService: NotificationService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const accessToken = localStorage.getItem(Keys.USER_TOKEN);
    if (accessToken) {
      const userData = localStorage.getItem(Keys.USER_DATA)
        ? JSON.parse(localStorage.getItem(Keys.USER_DATA))
        : null;

      let headers = new HttpHeaders({
        Authorization: `Bearer ${accessToken}`,
        'Accept-Language': this.sharedService.language,
      });

      if (userData) {
        headers = headers.append('Userid', userData.id);
      }

      request = request.clone({
        headers: headers,
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (
          error.status === 401 ||
          (error.status === 400 && error.error === 'invalid_grant') ||
          error.status === 0
        ) {
          if (!this.refreshingToken) {
            this.refreshingToken = true;
            this.tokenSubject.next(null);

            return from(this.msalService.acquireTokenSilent(loginRequest)).pipe(
              switchMap((response) => {
                this.refreshingToken = false;
                this.tokenSubject.next(response.accessToken);
                this.sharedService.changedUserToken(response?.accessToken);

                const clonedRequest = request.clone({
                  setHeaders: {
                    Authorization: `Bearer ${response.accessToken}`,
                  },
                });

                return next.handle(clonedRequest);
              }),
              catchError((refreshError) => {
                this.refreshingToken = false;
                this.sharedService.logOut();
                return throwError(() => {
                  this.notificationService.showErrorToast(
                    this.translateService.instant('COMMON.LOGIN-AGAIN')
                  );
                });
              })
            );
          } else {
            return this.tokenSubject.pipe(
              filter((token) => token !== null),
              take(1),
              switchMap((token) => {
                const clonedRequest = request.clone({
                  setHeaders: {
                    Authorization: `Bearer ${token}`,
                  },
                });
                return next.handle(clonedRequest);
              })
            );
          }
        } else {
          return throwError(() => error);
        }
      })
    );
  }
}
