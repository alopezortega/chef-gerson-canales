import { computed, inject, Injectable, signal } from '@angular/core';
import { SUPABASE_CLIENT } from '../config/supabase-client.token';
import type { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly supabaseClient = inject(SUPABASE_CLIENT);

  private readonly userState = signal<User | null>(null);
  private readonly loadingState = signal<boolean>(true);

  readonly user = this.userState.asReadonly();
  readonly isLoading = this.loadingState.asReadonly();
  readonly isAuthenticated = computed(() => this.user() !== null);

  constructor() {
    this.loadInitialSession();
    this.listenToAuthChanges();
  }

  private async loadInitialSession(): Promise<void> {
    try {
      const { data, error } = await this.supabaseClient.auth.getSession();

      if (error) {
        throw error;
      }

      this.userState.set(data.session?.user ?? null);
    } catch (error) {
      console.error('Unable to recover the authentication session:', error);

      this.userState.set(null);
    } finally {
      this.loadingState.set(false);
    }
  }

  private listenToAuthChanges(): void {
    this.supabaseClient.auth.onAuthStateChange((_event, session) => {
      this.userState.set(session?.user ?? null);
    });
  }

  async signIn(email: string, password: string): Promise<void> {
    const { error } = await this.supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabaseClient.auth.signOut();

    if (error) {
      throw error;
    }
  }
}
