import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { environment } from "../../../environments/environment";
import { AuthSession } from "../models/auth-session.model";

interface SignInRequest {
  email: string;
  password: string;
}

interface RefreshSessionRequest {
  refreshToken: string;
}

@Injectable({
  providedIn: "root",
})
export class AuthApiService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = `${environment.supabase.url}/functions/v1/auth`;

  signIn(email: string, password: string): Observable<AuthSession> {
    const body: SignInRequest = {
      email,
      password,
    };

    return this.http.post<AuthSession>(
      `${this.baseUrl}/login`,
      body,
    );
  }

  refreshSession(refreshToken: string): Observable<AuthSession> {
    const body: RefreshSessionRequest = {
      refreshToken,
    };

    return this.http.post<AuthSession>(
      `${this.baseUrl}/refresh`,
      body,
    );
  }

  signOut(accessToken: string): Observable<void> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.post<void>(
      `${this.baseUrl}/logout`,
      {},
      {
        headers,
      },
    );
  }
}
