import { TestBed } from "@angular/core/testing";
import { of, Subject, throwError } from "rxjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthApiService } from "../api/auth-api.service";
import { AuthSession } from "../models/auth-session.model";
import { AuthSessionService } from "./auth-session.service";
import { AuthStorageService } from "./auth-storage.service";

describe("AuthSessionService", () => {
  let service: AuthSessionService;

  const userMock = {
    id: "admin-user-id",
    email: "admin@example.com",
  };

  const sessionMock: AuthSession = {
    user: userMock,
    accessToken: "access-token",
    refreshToken: "refresh-token",
    expiresAt: 4_102_444_800,
  };

  const refreshedSessionMock: AuthSession = {
    user: userMock,
    accessToken: "refreshed-access-token",
    refreshToken: "refreshed-refresh-token",
    expiresAt: 4_102_444_800,
  };

  const refreshSessionMock = vi.fn();

  const getSessionMock = vi.fn();
  const setSessionMock = vi.fn();
  const clearSessionMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    getSessionMock.mockReturnValue(null);

    refreshSessionMock.mockReturnValue(
      of(refreshedSessionMock),
    );

    TestBed.configureTestingModule({
      providers: [
        AuthSessionService,
        {
          provide: AuthApiService,
          useValue: {
            refreshSession: refreshSessionMock,
          },
        },
        {
          provide: AuthStorageService,
          useValue: {
            getSession: getSessionMock,
            setSession: setSessionMock,
            clearSession: clearSessionMock,
          },
        },
      ],
    });

    service = TestBed.inject(AuthSessionService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should restore the stored session", () => {
    getSessionMock.mockReturnValue(sessionMock);

    const session = service.restoreStoredSession();

    expect(session).toEqual(sessionMock);
    expect(service.session()).toEqual(sessionMock);
    expect(service.user()).toEqual(userMock);
    expect(service.accessToken()).toBe("access-token");
    expect(service.isAuthenticated()).toBe(true);
  });

  it("should clear the session when no stored session exists", () => {
    getSessionMock.mockReturnValue(null);

    const session = service.restoreStoredSession();

    expect(session).toBeNull();

    expect(
      clearSessionMock,
    ).toHaveBeenCalledOnce();

    expect(service.session()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it("should persist and expose a session", () => {
    service.setSession(sessionMock);

    expect(
      setSessionMock,
    ).toHaveBeenCalledWith(sessionMock);

    expect(service.session()).toEqual(sessionMock);
    expect(service.user()).toEqual(userMock);
    expect(service.accessToken()).toBe("access-token");
    expect(service.isAuthenticated()).toBe(true);
  });

  it("should clear the persisted and in-memory session", () => {
    service.setSession(sessionMock);

    service.clearSession();

    expect(
      clearSessionMock,
    ).toHaveBeenCalled();

    expect(service.session()).toBeNull();
    expect(service.user()).toBeNull();
    expect(service.accessToken()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it("should refresh and store the new session", () => {
    service.setSession(sessionMock);

    let receivedSession: AuthSession | undefined;

    service
      .refreshSession()
      .subscribe((session) => {
        receivedSession = session;
      });

    expect(
      refreshSessionMock,
    ).toHaveBeenCalledWith(
      sessionMock.refreshToken,
    );

    expect(
      setSessionMock,
    ).toHaveBeenLastCalledWith(
      refreshedSessionMock,
    );

    expect(receivedSession).toEqual(
      refreshedSessionMock,
    );

    expect(service.session()).toEqual(
      refreshedSessionMock,
    );
  });

  it("should clear the session and fail when no refresh token exists", () => {
    let receivedError: unknown;

    service
      .refreshSession()
      .subscribe({
        error: (error) => {
          receivedError = error;
        },
      });

    expect(
      refreshSessionMock,
    ).not.toHaveBeenCalled();

    expect(
      clearSessionMock,
    ).toHaveBeenCalled();

    expect(
      receivedError,
    ).toBeInstanceOf(Error);

    expect(
      (receivedError as Error).message,
    ).toBe("No refresh token is available.");
  });

  it("should clear the session when refresh fails", () => {
    const refreshError = new Error("Unable to refresh session");

    service.setSession(sessionMock);

    refreshSessionMock.mockReturnValue(
      throwError(() => refreshError),
    );

    let receivedError: unknown;

    service
      .refreshSession()
      .subscribe({
        error: (error) => {
          receivedError = error;
        },
      });

    expect(
      clearSessionMock,
    ).toHaveBeenCalled();

    expect(receivedError).toBe(refreshError);

    expect(service.session()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it("should share a single refresh request between concurrent subscribers", () => {
    const refreshSubject = new Subject<AuthSession>();

    service.setSession(sessionMock);

    refreshSessionMock.mockReturnValue(
      refreshSubject.asObservable(),
    );

    let firstResult: AuthSession | undefined;
    let secondResult: AuthSession | undefined;

    service
      .refreshSession()
      .subscribe((session) => {
        firstResult = session;
      });

    service
      .refreshSession()
      .subscribe((session) => {
        secondResult = session;
      });

    expect(
      refreshSessionMock,
    ).toHaveBeenCalledOnce();

    refreshSubject.next(
      refreshedSessionMock,
    );

    refreshSubject.complete();

    expect(firstResult).toEqual(
      refreshedSessionMock,
    );

    expect(secondResult).toEqual(
      refreshedSessionMock,
    );

    expect(
      setSessionMock,
    ).toHaveBeenCalledTimes(2);

    expect(
      setSessionMock,
    ).toHaveBeenLastCalledWith(
      refreshedSessionMock,
    );
  });
});
