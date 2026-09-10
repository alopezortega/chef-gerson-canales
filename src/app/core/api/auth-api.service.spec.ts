import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";

import { environment } from "../../../environments/environment";
import { AuthSession } from "../models/auth-session.model";
import { AuthApiService } from "./auth-api.service";

describe("AuthApiService", () => {
  let service: AuthApiService;
  let httpTestingController: HttpTestingController;

  const baseUrl = `${environment.supabase.url}/functions/v1/auth`;

  const sessionMock: AuthSession = {
    user: {
      id: "admin-user-id",
      email: "admin@example.com",
    },
    accessToken: "access-token",
    refreshToken: "refresh-token",
    expiresAt: 4_102_444_800,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthApiService,
      ],
    });

    service = TestBed.inject(AuthApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should sign in with email and password", () => {
    service
      .signIn(
        "admin@example.com",
        "secure-password",
      )
      .subscribe((session) => {
        expect(session).toEqual(sessionMock);
      });

    const request = httpTestingController.expectOne(
      `${baseUrl}/login`,
    );

    expect(request.request.method).toBe("POST");

    expect(request.request.body).toEqual({
      email: "admin@example.com",
      password: "secure-password",
    });

    request.flush(sessionMock);
  });

  it("should refresh the session using the refresh token", () => {
    service
      .refreshSession("refresh-token")
      .subscribe((session) => {
        expect(session).toEqual(sessionMock);
      });

    const request = httpTestingController.expectOne(
      `${baseUrl}/refresh`,
    );

    expect(request.request.method).toBe("POST");

    expect(request.request.body).toEqual({
      refreshToken: "refresh-token",
    });

    request.flush(sessionMock);
  });

  it("should sign out using the access token", () => {
    service
      .signOut("access-token")
      .subscribe();

    const request = httpTestingController.expectOne(
      `${baseUrl}/logout`,
    );

    expect(request.request.method).toBe("POST");

    expect(
      request.request.headers.get("Authorization"),
    ).toBe("Bearer access-token");

    expect(request.request.body).toEqual({});

    request.flush(null);
  });
});
