import { computed, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthApiService } from "../api/auth-api.service";
import { AuthSession } from "../models/auth-session.model";
import { AuthSessionService } from "./auth-session.service";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let service: AuthService;

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

  const sessionState = signal<AuthSession | null>(null);

  const signInMock = vi.fn();
  const signOutMock = vi.fn();

  const restoreStoredSessionMock = vi.fn();
  const setSessionMock = vi.fn();
  const clearSessionMock = vi.fn();
  const refreshSessionMock = vi.fn();

  const authApiServiceMock = {
    signIn: signInMock,
    signOut: signOutMock,
  };

  const authSessionServiceMock = {
    session: sessionState.asReadonly(),

    user: computed(
      () => sessionState()?.user ?? null,
    ),

    accessToken: computed(
      () => sessionState()?.accessToken ?? null,
    ),

    isAuthenticated: computed(
      () =>
        sessionState()?.user !== undefined &&
        sessionState() !== null &&
        sessionState()?.accessToken !== undefined,
    ),

    restoreStoredSession: restoreStoredSessionMock,
    setSession: setSessionMock,
    clearSession: clearSessionMock,
    refreshSession: refreshSessionMock,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    sessionState.set(null);

    restoreStoredSessionMock.mockReturnValue(null);

    signInMock.mockReturnValue(of(sessionMock));
    signOutMock.mockReturnValue(of(undefined));

    refreshSessionMock.mockReturnValue(
      of(refreshedSessionMock),
    );

    setSessionMock.mockImplementation(
      (session: AuthSession) => {
        sessionState.set(session);
      },
    );

    clearSessionMock.mockImplementation(() => {
      sessionState.set(null);
    });

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthApiService,
          useValue: authApiServiceMock,
        },
        {
          provide: AuthSessionService,
          useValue: authSessionServiceMock,
        },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should finish initial loading with no authenticated user when no stored session exists", async () => {
    await vi.waitFor(() => {
      expect(service.isLoading()).toBe(false);
    });

    expect(
      restoreStoredSessionMock,
    ).toHaveBeenCalledOnce();

    expect(service.user()).toBeNull();
    expect(service.accessToken()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it("should recover a valid stored session without refreshing it", async () => {
    sessionState.set(sessionMock);

    restoreStoredSessionMock.mockReturnValue(
      sessionMock,
    );

    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthApiService,
          useValue: authApiServiceMock,
        },
        {
          provide: AuthSessionService,
          useValue: authSessionServiceMock,
        },
      ],
    });

    service = TestBed.inject(AuthService);

    await vi.waitFor(() => {
      expect(service.isLoading()).toBe(false);
    });

    expect(refreshSessionMock).not.toHaveBeenCalled();

    expect(service.user()).toEqual(userMock);
    expect(service.accessToken()).toBe("access-token");
    expect(service.isAuthenticated()).toBe(true);
  });

  it("should refresh an expired stored session during initial recovery", async () => {
    const expiredSession: AuthSession = {
      ...sessionMock,
      expiresAt: 1,
    };

    sessionState.set(expiredSession);

    restoreStoredSessionMock.mockReturnValue(
      expiredSession,
    );

    refreshSessionMock.mockImplementation(() => {
      sessionState.set(refreshedSessionMock);

      return of(refreshedSessionMock);
    });

    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthApiService,
          useValue: authApiServiceMock,
        },
        {
          provide: AuthSessionService,
          useValue: authSessionServiceMock,
        },
      ],
    });

    service = TestBed.inject(AuthService);

    await vi.waitFor(() => {
      expect(service.isLoading()).toBe(false);
    });

    expect(
      refreshSessionMock,
    ).toHaveBeenCalledOnce();

    expect(service.user()).toEqual(userMock);

    expect(service.accessToken()).toBe(
      "refreshed-access-token",
    );

    expect(service.isAuthenticated()).toBe(true);
  });

  it("should sign in and delegate the session to AuthSessionService", async () => {
    await service.signIn(
      "admin@example.com",
      "secure-password",
    );

    expect(signInMock).toHaveBeenCalledWith(
      "admin@example.com",
      "secure-password",
    );

    expect(setSessionMock).toHaveBeenCalledWith(
      sessionMock,
    );

    expect(service.user()).toEqual(userMock);
    expect(service.accessToken()).toBe("access-token");
    expect(service.isAuthenticated()).toBe(true);
  });

  it("should propagate a sign in error", async () => {
    const authenticationError = new Error("Invalid credentials");

    signInMock.mockReturnValue(
      throwError(() => authenticationError),
    );

    await expect(
      service.signIn(
        "admin@example.com",
        "wrong-password",
      ),
    ).rejects.toThrow(authenticationError);

    expect(setSessionMock).not.toHaveBeenCalled();
  });

  it("should delegate session refresh to AuthSessionService", async () => {
    const refreshedSession = await service.refreshSession();

    expect(
      refreshSessionMock,
    ).toHaveBeenCalledOnce();

    expect(refreshedSession).toEqual(
      refreshedSessionMock,
    );
  });

  it("should sign out using the current access token", async () => {
    sessionState.set(sessionMock);

    await service.signOut();

    expect(signOutMock).toHaveBeenCalledWith(
      "access-token",
    );

    expect(clearSessionMock).toHaveBeenCalled();

    expect(service.user()).toBeNull();
    expect(service.accessToken()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it("should clear the local session without calling the API when no access token exists", async () => {
    await service.signOut();

    expect(signOutMock).not.toHaveBeenCalled();

    expect(clearSessionMock).toHaveBeenCalled();
  });

  it("should clear the local session even when remote sign out fails", async () => {
    const signOutError = new Error("Unable to sign out");

    sessionState.set(sessionMock);

    signOutMock.mockReturnValue(
      throwError(() => signOutError),
    );

    await expect(
      service.signOut(),
    ).rejects.toThrow(signOutError);

    expect(clearSessionMock).toHaveBeenCalled();

    expect(service.user()).toBeNull();
    expect(service.accessToken()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it("should clear the session when initial session recovery fails", async () => {
    restoreStoredSessionMock.mockImplementation(
      () => {
        throw new Error("Unable to restore session");
      },
    );

    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthApiService,
          useValue: authApiServiceMock,
        },
        {
          provide: AuthSessionService,
          useValue: authSessionServiceMock,
        },
      ],
    });

    service = TestBed.inject(AuthService);

    await vi.waitFor(() => {
      expect(service.isLoading()).toBe(false);
    });

    expect(clearSessionMock).toHaveBeenCalled();
    expect(service.isAuthenticated()).toBe(false);
  });
});
