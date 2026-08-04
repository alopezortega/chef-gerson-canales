import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GuardResult, provideRouter, Router, UrlTree } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const isLoadingState = signal<boolean>(false);
  const isAuthenticatedState = signal<boolean>(false);

  beforeEach(() => {
    isLoadingState.set(false);
    isAuthenticatedState.set(false);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isLoading: isLoadingState.asReadonly(),
            isAuthenticated: isAuthenticatedState.asReadonly(),
          },
        },
      ],
    });
  });

  it('should allow access when the user is authenticated', async () => {
    isAuthenticatedState.set(true);

    const guardResult = TestBed.runInInjectionContext(() =>
      authGuard({} as never, {} as never),
    ) as Observable<GuardResult>;

    const result = await firstValueFrom(guardResult);

    expect(result).toBe(true);
  });

  it('should redirect to the admin login page when the user is not authenticated', async () => {
    const router = TestBed.inject(Router);

    const guardResult = TestBed.runInInjectionContext(() =>
      authGuard({} as never, {} as never),
    ) as Observable<GuardResult>;

    const result = await firstValueFrom(guardResult);

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/admin/login');
  });

  it('should wait until loading is false before deciding', async () => {
    isLoadingState.set(true);
    isAuthenticatedState.set(true);

    const guardResult = TestBed.runInInjectionContext(() =>
      authGuard({} as never, {} as never),
    ) as Observable<GuardResult>;

    const resultPromise = firstValueFrom(guardResult);

    let hasResolved = false;

    resultPromise.then(() => {
      hasResolved = true;
    });

    await Promise.resolve();

    expect(hasResolved).toBe(false);

    isLoadingState.set(false);

    const result = await resultPromise;

    expect(result).toBe(true);
  });
});
