import { TestBed } from '@angular/core/testing';
import type { User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SUPABASE_CLIENT } from '../config/supabase-client.token';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const userMock = {
    id: 'admin-user-id',
    email: 'admin@example.com',
  } as User;

  const getSessionMock = vi.fn();
  const signInWithPasswordMock = vi.fn();
  const signOutMock = vi.fn();
  const onAuthStateChangeMock = vi.fn();

  const supabaseClientMock = {
    auth: {
      getSession: getSessionMock,
      signInWithPassword: signInWithPasswordMock,
      signOut: signOutMock,
      onAuthStateChange: onAuthStateChangeMock,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    getSessionMock.mockResolvedValue({
      data: {
        session: null,
      },
      error: null,
    });

    onAuthStateChangeMock.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    });

    signInWithPasswordMock.mockResolvedValue({
      data: {
        user: userMock,
        session: null,
      },
      error: null,
    });

    signOutMock.mockResolvedValue({
      error: null,
    });

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        {
          provide: SUPABASE_CLIENT,
          useValue: supabaseClientMock,
        },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should recover the user from the initial session', async () => {
    getSessionMock.mockResolvedValue({
      data: {
        session: {
          user: userMock,
        },
      },
      error: null,
    });

    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        {
          provide: SUPABASE_CLIENT,
          useValue: supabaseClientMock,
        },
      ],
    });

    service = TestBed.inject(AuthService);

    await vi.waitFor(() => {
      expect(service.isLoading()).toBe(false);
    });

    expect(service.user()).toEqual(userMock);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should keep the user as null when there is no initial session', async () => {
    await vi.waitFor(() => {
      expect(service.isLoading()).toBe(false);
    });

    expect(service.user()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should update the user when the authentication state changes', () => {
    const authChangeCallback = onAuthStateChangeMock.mock.calls[0][0];

    authChangeCallback('SIGNED_IN', {
      user: userMock,
    });

    expect(service.user()).toEqual(userMock);
    expect(service.isAuthenticated()).toBe(true);

    authChangeCallback('SIGNED_OUT', null);

    expect(service.user()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should sign in with email and password', async () => {
    await service.signIn('admin@example.com', 'secure-password');

    expect(signInWithPasswordMock).toHaveBeenCalledWith({
      email: 'admin@example.com',
      password: 'secure-password',
    });
  });

  it('should throw when sign in fails', async () => {
    const authenticationError = new Error('Invalid credentials');

    signInWithPasswordMock.mockResolvedValue({
      data: {
        user: null,
        session: null,
      },
      error: authenticationError,
    });

    await expect(service.signIn('admin@example.com', 'wrong-password')).rejects.toThrow(
      authenticationError,
    );
  });

  it('should sign out', async () => {
    await service.signOut();

    expect(signOutMock).toHaveBeenCalledOnce();
  });

  it('should throw when sign out fails', async () => {
    const signOutError = new Error('Unable to sign out');

    signOutMock.mockResolvedValue({
      error: signOutError,
    });

    await expect(service.signOut()).rejects.toThrow(signOutError);
  });
});
