import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { vi } from "vitest";

import { environment } from "../../../environments/environment";
import { AuthSession } from "../models/auth-session.model";
import { AuthSessionService } from "../services/auth-session.service";
import { authInterceptor } from "./auth.interceptor";

describe("authInterceptor", () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  const apiBaseUrl = `${environment.supabase.url}/functions/v1`;

  const sessionMock: AuthSession = {
    user: {
      id: "admin-user-id",
      email: "admin@example.com",
    },
    accessToken: "access-token",
    refreshToken: "refresh-token",
    expiresAt: 4_102_444_800,
  };

  const refreshedSessionMock: AuthSession = {
    user: {
      id: "admin-user-id",
      email: "admin@example.com",
    },
    accessToken: "refreshed-access-token",
    refreshToken: "refreshed-refresh-token",
    expiresAt: 4_102_444_800,
  };

  const sessionMockSignal = vi.fn();
  const accessTokenMock = vi.fn();
  const refreshSessionMock = vi.fn();
  const clearSessionMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    sessionMockSignal.mockReturnValue(sessionMock);

    accessTokenMock.mockReturnValue(
      sessionMock.accessToken,
    );

    refreshSessionMock.mockReturnValue(
      of(refreshedSessionMock),
    );

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withInterceptors([
            authInterceptor,
          ]),
        ),
        provideHttpClientTesting(),
        {
          provide: AuthSessionService,
          useValue: {
            session: sessionMockSignal,
            accessToken: accessTokenMock,
            refreshSession: refreshSessionMock,
            clearSession: clearSessionMock,
          },
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);

    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it("should add the bearer token to application API requests", () => {
    httpClient
      .get(`${apiBaseUrl}/quote-requests`)
      .subscribe();

    const request = httpTestingController.expectOne(
      `${apiBaseUrl}/quote-requests`,
    );

    expect(
      request.request.headers.get("Authorization"),
    ).toBe("Bearer access-token");

    request.flush({});
  });

  it("should not add the bearer token when no access token exists", () => {
    accessTokenMock.mockReturnValue(null);

    httpClient
      .get(`${apiBaseUrl}/quote-requests`)
      .subscribe();

    const request = httpTestingController.expectOne(
      `${apiBaseUrl}/quote-requests`,
    );

    expect(
      request.request.headers.has("Authorization"),
    ).toBe(false);

    request.flush({});
  });

  it("should not add the bearer token to auth requests", () => {
    httpClient
      .post(
        `${apiBaseUrl}/auth/login`,
        {
          email: "admin@example.com",
          password: "secure-password",
        },
      )
      .subscribe();

    const request = httpTestingController.expectOne(
      `${apiBaseUrl}/auth/login`,
    );

    expect(
      request.request.headers.has("Authorization"),
    ).toBe(false);

    request.flush({});
  });

  it("should not add the bearer token to translation requests", () => {
    httpClient
      .get("/i18n/es.json")
      .subscribe();

    const request = httpTestingController.expectOne(
      "/i18n/es.json",
    );

    expect(
      request.request.headers.has("Authorization"),
    ).toBe(false);

    request.flush({});
  });

  it("should not add the bearer token to external requests", () => {
    httpClient
      .get("https://example.com/data")
      .subscribe();

    const request = httpTestingController.expectOne(
      "https://example.com/data",
    );

    expect(
      request.request.headers.has("Authorization"),
    ).toBe(false);

    request.flush({});
  });

  it("should refresh the session and retry the request after a 401 response", () => {
    let responseBody: unknown;

    httpClient
      .get(`${apiBaseUrl}/quote-requests`)
      .subscribe((response) => {
        responseBody = response;
      });

    const firstRequest = httpTestingController.expectOne(
      `${apiBaseUrl}/quote-requests`,
    );

    expect(
      firstRequest.request.headers.get(
        "Authorization",
      ),
    ).toBe("Bearer access-token");

    firstRequest.flush(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
        statusText: "Unauthorized",
      },
    );

    expect(
      refreshSessionMock,
    ).toHaveBeenCalledOnce();

    const retryRequest = httpTestingController.expectOne(
      `${apiBaseUrl}/quote-requests`,
    );

    expect(
      retryRequest.request.headers.get(
        "Authorization",
      ),
    ).toBe("Bearer refreshed-access-token");

    retryRequest.flush({
      success: true,
    });

    expect(responseBody).toEqual({
      success: true,
    });
  });

  it("should clear the session and propagate the 401 when no refresh token exists", () => {
    sessionMockSignal.mockReturnValue({
      ...sessionMock,
      refreshToken: "",
    });

    let receivedStatus: number | undefined;

    httpClient
      .get(`${apiBaseUrl}/quote-requests`)
      .subscribe({
        error: (error) => {
          receivedStatus = error.status;
        },
      });

    const request = httpTestingController.expectOne(
      `${apiBaseUrl}/quote-requests`,
    );

    request.flush(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
        statusText: "Unauthorized",
      },
    );

    expect(
      clearSessionMock,
    ).toHaveBeenCalledOnce();

    expect(
      refreshSessionMock,
    ).not.toHaveBeenCalled();

    expect(receivedStatus).toBe(401);
  });

  it("should propagate a non-401 error without refreshing the session", () => {
    let receivedStatus: number | undefined;

    httpClient
      .get(`${apiBaseUrl}/quote-requests`)
      .subscribe({
        error: (error) => {
          receivedStatus = error.status;
        },
      });

    const request = httpTestingController.expectOne(
      `${apiBaseUrl}/quote-requests`,
    );

    request.flush(
      {
        message: "Server error",
      },
      {
        status: 500,
        statusText: "Server Error",
      },
    );

    expect(
      refreshSessionMock,
    ).not.toHaveBeenCalled();

    expect(
      clearSessionMock,
    ).not.toHaveBeenCalled();

    expect(receivedStatus).toBe(500);
  });

  it("should propagate the refresh error when session refresh fails", () => {
    const refreshError = new Error("Unable to refresh session");

    refreshSessionMock.mockReturnValue(
      throwError(() => refreshError),
    );

    let receivedError: unknown;

    httpClient
      .get(`${apiBaseUrl}/quote-requests`)
      .subscribe({
        error: (error) => {
          receivedError = error;
        },
      });

    const request = httpTestingController.expectOne(
      `${apiBaseUrl}/quote-requests`,
    );

    request.flush(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
        statusText: "Unauthorized",
      },
    );

    expect(
      refreshSessionMock,
    ).toHaveBeenCalledOnce();

    expect(receivedError).toBe(
      refreshError,
    );
  });
});
