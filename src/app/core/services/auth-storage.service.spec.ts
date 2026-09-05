import { PLATFORM_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { AuthSession } from "../models/auth-session.model";
import { AuthStorageService } from "./auth-storage.service";

describe("AuthStorageService", () => {
  const storageKey = "chef-gerson-auth-session";

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
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthStorageService,
        {
          provide: PLATFORM_ID,
          useValue: "browser",
        },
      ],
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should be created", () => {
    const service = TestBed.inject(AuthStorageService);

    expect(service).toBeTruthy();
  });

  it("should return null when no session is stored", () => {
    const service = TestBed.inject(AuthStorageService);

    expect(service.getSession()).toBeNull();
  });

  it("should store and recover the session", () => {
    const service = TestBed.inject(AuthStorageService);

    service.setSession(sessionMock);

    expect(service.getSession()).toEqual(sessionMock);
  });

  it("should remove the stored session", () => {
    const service = TestBed.inject(AuthStorageService);

    service.setSession(sessionMock);
    service.clearSession();

    expect(service.getSession()).toBeNull();
  });

  it("should clear invalid stored JSON and return null", () => {
    const service = TestBed.inject(AuthStorageService);

    localStorage.setItem(
      storageKey,
      "{invalid-json",
    );

    expect(service.getSession()).toBeNull();

    expect(
      localStorage.getItem(storageKey),
    ).toBeNull();
  });

  it("should not access browser storage on the server", () => {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        AuthStorageService,
        {
          provide: PLATFORM_ID,
          useValue: "server",
        },
      ],
    });

    const service = TestBed.inject(AuthStorageService);

    expect(service.getSession()).toBeNull();

    service.setSession(sessionMock);
    service.clearSession();

    expect(
      localStorage.getItem(storageKey),
    ).toBeNull();
  });
});
