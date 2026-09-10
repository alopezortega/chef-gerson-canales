import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'admin-login',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss',
})
export class AdminLogin {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly errorLoginState = signal<boolean>(false);
  protected readonly errorLogin = this.errorLoginState.asReadonly();

  private readonly isSubmittingState = signal<boolean>(false);
  protected readonly isSubmitting = this.isSubmittingState.asReadonly();

  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected async submitLogin(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { email, password } = this.loginForm.getRawValue();

    this.errorLoginState.set(false);
    this.isSubmittingState.set(true);

    try {
      await this.authService.signIn(email, password);
      this.router.navigateByUrl('/admin');
    } catch (error) {
      console.error('Unable to sign in:', error);
      this.errorLoginState.set(true);
    } finally {
      this.isSubmittingState.set(false);
    }
  }
}
