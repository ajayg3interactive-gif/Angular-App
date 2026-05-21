import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { RbacService } from '../../services/rbac.service';
import { NotificationService } from '../../services/notification.service';
import { ThemeName } from '../../interfaces/auth-user';

interface NavItem {
  key: string;
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private router     = inject(Router);
  private destroyRef = inject(DestroyRef);
  auth               = inject(AuthService);
  themeService       = inject(ThemeService);
  rbac               = inject(RbacService);
  notifSvc           = inject(NotificationService);

  isMobileOpen    = signal(false);
  activeRoute     = signal('');
  showThemePicker = signal(false);

  readonly sidebarThemes: { name: ThemeName; bg: string; accent: string; label: string }[] = [
    { name: 'light',  bg: '#f9fafb', accent: '#6366f1', label: 'Light' },
    { name: 'blue',   bg: '#f9fafb', accent: '#2563eb', label: 'Blue' },
    { name: 'purple', bg: '#f9fafb', accent: '#7c3aed', label: 'Purple' },
    { name: 'dark',   bg: '#0f172a', accent: '#818cf8', label: 'Dark' },
    { name: 'modern', bg: '#020617', accent: '#06b6d4', label: 'Modern' },
  ];

  /** Role-based navigation items. */
  readonly navItems = computed((): NavItem[] => {
    const role = this.rbac.currentRole();
    if (role === 'admin') return [
      { key: 'admin-dashboard', label: 'Dashboard',  route: '/admin-dashboard', icon: 'grid' },
      { key: 'projects',        label: 'Projects',   route: '/projects',        icon: 'folder' },
      { key: 'kanban',          label: 'Kanban',     route: '/kanban',          icon: 'board' },
      { key: 'teams',           label: 'Teams',      route: '/teams',           icon: 'users' },
      { key: 'users',           label: 'Users',      route: '/users',           icon: 'user-cog' },
      { key: 'analytics',       label: 'Analytics',  route: '/analytics',       icon: 'chart' },
      // { key: 'settings',        label: 'Settings',   route: '/settings',        icon: 'cog' },
    ];
    if (role === 'developer') return [
      { key: 'developer-dashboard', label: 'Dashboard',  route: '/developer-dashboard', icon: 'grid' },
      { key: 'my-tasks',            label: 'My Tasks',   route: '/my-tasks',            icon: 'check' },
      { key: 'kanban',              label: 'Work Board', route: '/kanban',              icon: 'board' },
      { key: 'projects',            label: 'Projects',   route: '/projects',            icon: 'folder' },
    ];
    if (role === 'client') return [
      { key: 'client-dashboard', label: 'Dashboard',   route: '/client-dashboard', icon: 'grid' },
      { key: 'my-projects',      label: 'My Projects', route: '/my-projects',      icon: 'folder' },
    ];
    return [];
  });

  /** Always-visible bottom items for all authenticated users. */
  readonly bottomItems = computed((): NavItem[] => [
    { key: 'notifications', label: 'Notifications', route: '/notifications', icon: 'bell' },
    { key: 'profile',       label: 'Profile',       route: '/profile',       icon: 'user' },
  ]);

  constructor() {
    this.activeRoute.set(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
      .subscribe(e => { this.activeRoute.set(e.url); this.isMobileOpen.set(false); });
  }

  get userInitial(): string { return (this.auth.currentUser()?.name ?? 'U').charAt(0).toUpperCase(); }

  sidebarClass = computed(() => {
    const base = 'fixed top-0 left-0 h-full w-64 z-40 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0';
    return this.isMobileOpen() ? `${base} translate-x-0` : `${base} -translate-x-full`;
  });

  isActive(route: string): boolean { return this.activeRoute().startsWith(route); }

  navigate(route: string): void {
    this.router.navigate([route]);
    this.isMobileOpen.set(false);
    this.showThemePicker.set(false);
  }

  toggleMobile():      void { this.isMobileOpen.update(v => !v); }
  toggleThemePicker(): void { this.showThemePicker.update(v => !v); }
  logout():            void { this.isMobileOpen.set(false); this.auth.logout(); }
}
