import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { User } from '../interfaces/user';
import { AuthUser } from '../interfaces/auth-user';
import { ROLE_DEFINITIONS } from '../interfaces/rbac';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router     = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser  = isPlatformBrowser(this.platformId);

  private readonly STORAGE_KEY = 'auth_user';

  private _currentUser  = signal<AuthUser | null>(null);
  private _initialized  = signal(false);

  readonly currentUser  = this._currentUser.asReadonly();
  readonly isLoggedIn   = computed(() => this._currentUser() !== null);
  readonly initialized  = this._initialized.asReadonly();

  /** Called by APP_INITIALIZER — runs before any route guard executes. */
  init(): Promise<void> {
    if (this.isBrowser) {
      this.restoreSession();
    }
    this._initialized.set(true);
    return Promise.resolve();
  }

  /** Persist authenticated user to localStorage and update signal. */
  login(user: User): void {
    const authUser: AuthUser = {
      id:      user.id,
      name:    user.name,
      email:   user.email,
      role:    user.role ?? 'developer',
      token:   btoa(`${user.email}:${Date.now()}`),
      loginAt: new Date().toISOString(),
    };
    if (this.isBrowser) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authUser));
    }
    this._currentUser.set(authUser);
  }

  /** Clear session and redirect to login. */
  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  /** Returns current user snapshot (null if not logged in). */
  getCurrentUser(): AuthUser | null {
    return this._currentUser();
  }

  /** Navigate to role-based default dashboard. */
  navigateToDashboard(): void {
    const role = this._currentUser()?.role ?? 'developer';
    const route = ROLE_DEFINITIONS[role as keyof typeof ROLE_DEFINITIONS]?.defaultRoute ?? '/dashboard';
    this.router.navigate([route]);
  }

  /** Update the stored user (e.g. after profile edit). */
  updateStoredUser(partial: Partial<AuthUser>): void {
    const current = this._currentUser();
    if (!current) return;
    const updated = { ...current, ...partial };
    if (this.isBrowser) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    }
    this._currentUser.set(updated);
  }

  private restoreSession(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return;
    try {
      this._currentUser.set(JSON.parse(stored) as AuthUser);
    } catch {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
}
