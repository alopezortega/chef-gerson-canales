import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, switchMap, throwError } from "rxjs";

import { environment } from "../../../environments/environment";
import { AuthSessionService } from "../services/auth-session.service";

const API_BASE_URL = `${environment.supabase.url}/functions/v1`;

const AUTH_API_URL = `${API_BASE_URL}/auth`;

export const authInterceptor: HttpInterceptorFn = (
  request,
  next,
) => {
  const isApplicationApiRequest = request.url.startsWith(API_BASE_URL);

  const isAuthRequest = request.url.startsWith(AUTH_API_URL);

  if (!isApplicationApiRequest || isAuthRequest) {
    return next(request);
  }

  const authSessionService = inject(AuthSessionService);

  const accessToken = authSessionService.accessToken();

  const authenticatedRequest = accessToken
    ? request.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    : request;

  return next(authenticatedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      const currentSession = authSessionService.session();

      if (!currentSession?.refreshToken) {
        authSessionService.clearSession();

        return throwError(() => error);
      }

      return authSessionService
        .refreshSession()
        .pipe(
          switchMap((refreshedSession) => {
            const retryRequest = request.clone({
              setHeaders: {
                Authorization: `Bearer ${refreshedSession.accessToken}`,
              },
            });

            return next(retryRequest);
          }),
        );
    }),
  );
};
