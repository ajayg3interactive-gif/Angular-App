import { Routes } from '@angular/router';
import { authGuard, guestGuard, adminGuard, developerGuard, clientGuard } from './guards/auth.guard';

export const routes: Routes = [
  /* ── Public ── */
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./login/login').then(m => m.Login),
    canActivate: [guestGuard],
  },
  {
    path: 'signup',
    loadComponent: () => import('./signup/signup').then(m => m.Signup),
    canActivate: [guestGuard],
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./pages/unauthorized/unauthorized').then(m => m.UnauthorizedPage),
  },

  /* ── Smart redirect dashboard ── */
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard],
  },

  /* ── Admin routes ── */
  {
    path: 'admin-dashboard',
    loadComponent: () => import('./pages/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard),
    canActivate: [adminGuard],
  },
  {
    path: 'users',
    loadComponent: () => import('./pages/users/users-page').then(m => m.UsersPage),
    canActivate: [adminGuard],
  },
  {
    path: 'teams',
    loadComponent: () => import('./pages/teams/teams').then(m => m.TeamsPage),
    canActivate: [adminGuard],
  },
  {
    path: 'analytics',
    loadComponent: () => import('./pages/analytics/analytics').then(m => m.AnalyticsPage),
    canActivate: [adminGuard],
  },
 
  /* ── Developer routes ── */
  {
    path: 'developer-dashboard',
    loadComponent: () => import('./pages/developer-dashboard/developer-dashboard').then(m => m.DeveloperDashboard),
    canActivate: [developerGuard],
  },
  {
    path: 'my-tasks',
    loadComponent: () => import('./pages/my-tasks/my-tasks').then(m => m.MyTasksPage),
    canActivate: [developerGuard],
  },

  /* ── Shared: Admin + Developer ── */
  {
    path: 'projects',
    loadComponent: () => import('./pages/projects/projects').then(m => m.ProjectsPage),
    canActivate: [developerGuard],
  },
  {
    path: 'kanban',
    loadComponent: () => import('./pages/kanban/kanban').then(m => m.KanbanPage),
    canActivate: [developerGuard],
  },

  /* ── Client routes ── */
  {
    path: 'client-dashboard',
    loadComponent: () => import('./pages/client-dashboard/client-dashboard').then(m => m.ClientDashboard),
    canActivate: [clientGuard],
  },
  {
    path: 'my-projects',
    loadComponent: () => import('./pages/my-projects/my-projects').then(m => m.MyProjectsPage),
    canActivate: [clientGuard],
  },

  /* ── All authenticated users ── */
  {
    path: 'notifications',
    loadComponent: () => import('./pages/notifications/notifications').then(m => m.NotificationsPage),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then(m => m.ProfilePage),
    canActivate: [authGuard],
  },

  { path: '**', redirectTo: 'dashboard' },
];
