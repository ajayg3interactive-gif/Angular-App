import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { ThemeName } from '../../interfaces/auth-user';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  auth = inject(AuthService);
  themeService = inject(ThemeService);

  isMobileOpen = signal(false);
  activeMenu = signal<'dashboard' | 'users' | 'profile'>('dashboard');
  showThemePicker = signal(false);

  readonly sidebarThemes: { name: ThemeName; bg: string; accent: string; label: string }[] = [
    { name: 'light', bg: '#f9fafb', accent: '#6366f1', label: 'Light' },
    { name: 'blue', bg: '#f9fafb', accent: '#2563eb', label: 'Blue' },
    { name: 'purple', bg: '#f9fafb', accent: '#7c3aed', label: 'Purple' },
    { name: 'dark', bg: '#0f172a', accent: '#818cf8', label: 'Dark' },
    { name: 'modern', bg: '#020617', accent: '#06b6d4', label: 'Modern' },
  ];

  constructor() {
    this.syncMenuFromUrl(this.router.url);
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(e => this.syncMenuFromUrl(e.url));
  }

  private syncMenuFromUrl(url: string): void {
    if (url.startsWith('/users')) this.activeMenu.set('users');
    else if (url.startsWith('/profile')) this.activeMenu.set('profile');
    else this.activeMenu.set('dashboard');
  }

  get userInitial(): string {
    return (this.auth.currentUser()?.name ?? 'U').charAt(0).toUpperCase();
  }

  sidebarClass = computed(() => {
    const base = 'fixed top-0 left-0 h-full w-64 z-40 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0';
    return this.isMobileOpen() ? `${base} translate-x-0` : `${base} -translate-x-full`;
  });

  navItemStyle(menu: string): Record<string, string> {
    const isActive = this.activeMenu() === menu;
    return {
      'background-color': isActive ? 'var(--sidebar-active)' : 'transparent',
      'color': isActive ? '#ffffff' : 'var(--sidebar-text)',
      'opacity': isActive ? '1' : '0.75',
    };
  }

  setActive(menu: 'dashboard' | 'users' | 'profile'): void {
    this.isMobileOpen.set(false);
    this.showThemePicker.set(false);
    this.router.navigate([`/${menu}`]);
  }

  toggleMobile(): void {
    this.isMobileOpen.update(v => !v);
  }

  toggleThemePicker(): void {
    this.showThemePicker.update(v => !v);
  }

  logout(): void {
    this.isMobileOpen.set(false);
    this.auth.logout();
  }
}
