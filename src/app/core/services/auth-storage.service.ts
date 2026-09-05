import { isPlatformBrowser } from "@angular/common";
import { inject, Injectable, PLATFORM_ID } from "@angular/core";

import { AuthSession } from "../models/auth-session.model";

const AUTH_SESSION_STORAGE_KEY = "chef-gerson-auth-session";

@Injectable({
  providedIn: "root",
})
export class AuthStorageService {
  private readonly platformId = inject(PLATFORM_ID);

  getSession(): AuthSession | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const storedSession = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);

    if (!storedSession) {
      return null;
    }

    try {
      return JSON.parse(storedSession) as AuthSession;
    } catch {
      this.clearSession();
      return null;
    }
  }

  setSession(session: AuthSession): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem(
      AUTH_SESSION_STORAGE_KEY,
      JSON.stringify(session),
    );
  }

  clearSession(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  }
}
