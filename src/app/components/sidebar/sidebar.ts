import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  isMobileOpen = signal(false);
  activeMenu = signal<'dashboard' | 'users'>('dashboard');

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
    this.activeMenu.set(url.startsWith('/users') ? 'users' : 'dashboard');
  }

  sidebarClass = computed(() => {
    const base =
      'fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-40 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0';
    return this.isMobileOpen() ? `${base} translate-x-0` : `${base} -translate-x-full`;
  });

  navClass(menu: 'dashboard' | 'users'): string {
    const base = 'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium';
    return this.activeMenu() === menu
      ? `${base} bg-indigo-600 text-white shadow-lg`
      : `${base} text-slate-400 hover:bg-slate-800 hover:text-white`;
  }

  setActive(menu: 'dashboard' | 'users'): void {
    this.isMobileOpen.set(false);
    this.router.navigate([`/${menu}`]);
  }

  toggleMobile(): void {
    this.isMobileOpen.update(v => !v);
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}
