import { computed, inject, Injectable, signal } from "@angular/core";
import {
  catchError,
  finalize,
  Observable,
  shareReplay,
  tap,
  throwError,
} from "rxjs";

import { AuthApiService } from "../api/auth-api.service";
import { AuthSession } from "../models/auth-session.model";
import { AuthStorageService } from "./auth-storage.service";

@Injectable({
  providedIn: "root",
})
export class AuthSessionService {
  private readonly authApiService = inject(AuthApiService);
  private readonly authStorageService = inject(AuthStorageService);

  private readonly sessionState = signal<AuthSession | null>(null);

  private refreshRequest$: Observable<AuthSession> | null = null;

  readonly session = this.sessionState.asReadonly();

  readonly user = computed(
    () => this.session()?.user ?? null,
  );

  readonly accessToken = computed(
    () => this.session()?.accessToken ?? null,
  );

  readonly isAuthenticated = computed(
    () =>
      this.user() !== null &&
      this.accessToken() !== null,
  );

  restoreStoredSession(): AuthSession | null {
    const session = this.authStorageService.getSession();

    if (!session) {
      this.clearSession();
      return null;
    }

    this.sessionState.set(session);

    return session;
  }

  setSession(session: AuthSession): void {
    this.authStorageService.setSession(session);
    this.sessionState.set(session);
  }

  clearSession(): void {
    this.authStorageService.clearSession();
    this.sessionState.set(null);
  }

  refreshSession(): Observable<AuthSession> {
    if (this.refreshRequest$) {
      return this.refreshRequest$;
    }

    const currentSession = this.session();

    if (!currentSession?.refreshToken) {
      this.clearSession();

      return throwError(
        () => new Error("No refresh token is available."),
      );
    }

    this.refreshRequest$ = this.authApiService
      .refreshSession(currentSession.refreshToken)
      .pipe(
        tap((session) => {
          this.setSession(session);
        }),
        catchError((error) => {
          this.clearSession();

          return throwError(() => error);
        }),
        finalize(() => {
          this.refreshRequest$ = null;
        }),
        shareReplay({
          bufferSize: 1,
          refCount: false,
        }),
      );

    return this.refreshRequest$;
  }
}
