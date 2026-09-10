import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { vi } from 'vitest';

import { AuthService } from '../../core/services/auth.service';
import { AdminLogin } from './admin-login';

describe('AdminLogin', () => {
  let component: AdminLogin;
  let fixture: ComponentFixture<AdminLogin>;

  const signInMock = vi.fn();
  const navigateByUrlMock = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();

    signInMock.mockResolvedValue(undefined);
    navigateByUrlMock.mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [AdminLogin],
      providers: [
        provideRouter([]),
        provideTranslateService({
          lang: 'es',
          fallbackLang: 'es',
        }),
        {
          provide: AuthService,
          useValue: {
            signIn: signInMock,
          },
        },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);

    vi.spyOn(router, 'navigateByUrl').mockImplementation(navigateByUrlMock);

    fixture = TestBed.createComponent(AdminLogin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should mark the form as touched and not sign in when the form is invalid', async () => {
    await component['submitLogin']();

    expect(component['loginForm'].controls.email.touched).toBe(true);
    expect(component['loginForm'].controls.password.touched).toBe(true);
    expect(signInMock).not.toHaveBeenCalled();
    expect(navigateByUrlMock).not.toHaveBeenCalled();
  });

  it('should sign in with the form credentials', async () => {
    component['loginForm'].setValue({
      email: 'admin@example.com',
      password: 'secure-password',
    });

    await component['submitLogin']();

    expect(signInMock).toHaveBeenCalledWith('admin@example.com', 'secure-password');
  });

  it('should navigate to the admin page after a successful login', async () => {
    component['loginForm'].setValue({
      email: 'admin@example.com',
      password: 'secure-password',
    });

    await component['submitLogin']();

    expect(navigateByUrlMock).toHaveBeenCalledWith('/admin');
  });

  it('should show the authentication error when login fails', async () => {
    const authenticationError = new Error('Invalid credentials');

    signInMock.mockRejectedValue(authenticationError);

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    component['loginForm'].setValue({
      email: 'admin@example.com',
      password: 'wrong-password',
    });

    await component['submitLogin']();

    expect(component['errorLogin']()).toBe(true);
    expect(component['isSubmitting']()).toBe(false);
    expect(navigateByUrlMock).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Unable to sign in:', authenticationError);

    consoleErrorSpy.mockRestore();
  });

  it('should keep the submitting state active while login is pending', async () => {
    let resolveSignIn!: () => void;

    signInMock.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSignIn = resolve;
        }),
    );

    component['loginForm'].setValue({
      email: 'admin@example.com',
      password: 'secure-password',
    });

    const submissionPromise = component['submitLogin']();

    expect(component['isSubmitting']()).toBe(true);

    resolveSignIn();
    await submissionPromise;

    expect(component['isSubmitting']()).toBe(false);
  });
});
