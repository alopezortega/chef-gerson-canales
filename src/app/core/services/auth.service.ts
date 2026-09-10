import { inject, Injectable, signal } from "@angular/core";
import { firstValueFrom } from "rxjs";

import { AuthApiService } from "../api/auth-api.service";
import { AuthSession } from "../models/auth-session.model";
import { AuthSessionService } from "./auth-session.service";

const SESSION_EXPIRATION_MARGIN_SECONDS = 60;

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly authApiService = inject(AuthApiService);
  private readonly authSessionService = inject(AuthSessionService);

  private readonly loadingState = signal<boolean>(true);

  readonly user = this.authSessionService.user;
  readonly accessToken = this.authSessionService.accessToken;
  readonly isAuthenticated = this.authSessionService.isAuthenticated;

  readonly isLoading = this.loadingState.asReadonly();

  constructor() {
    void this.loadInitialSession();
  }

  async signIn(email: string, password: string): Promise<void> {
    const session = await firstValueFrom(
      this.authApiService.signIn(email, password),
    );

    this.authSessionService.setSession(session);
  }

  async signOut(): Promise<void> {
    const accessToken = this.authSessionService.accessToken();

    if (!accessToken) {
      this.authSessionService.clearSession();
      return;
    }

    try {
      await firstValueFrom(
        this.authApiService.signOut(accessToken),
      );
    } finally {
      this.authSessionService.clearSession();
    }
  }

  async refreshSession(): Promise<AuthSession> {
    return firstValueFrom(
      this.authSessionService.refreshSession(),
    );
  }

  private async loadInitialSession(): Promise<void> {
    try {
      const storedSession = this.authSessionService.restoreStoredSession();

      if (!storedSession) {
        return;
      }

      if (this.isSessionExpired(storedSession)) {
        await this.refreshSession();
      }
    } catch (error) {
      console.error(
        "Unable to recover the authentication session:",
        error,
      );

      this.authSessionService.clearSession();
    } finally {
      this.loadingState.set(false);
    }
  }

  private isSessionExpired(session: AuthSession): boolean {
    const currentTimestamp = Math.floor(Date.now() / 1000);

    return (
      session.expiresAt <=
        currentTimestamp +
          SESSION_EXPIRATION_MARGIN_SECONDS
    );
  }
}
