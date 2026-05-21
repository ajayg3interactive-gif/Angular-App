import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/** Requires any authenticated user. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const toast  = inject(ToastService);

  if (auth.isLoggedIn()) return true;

  toast.error('Please login to continue');
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** Prevents logged-in users from accessing login / signup. */
export const guestGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) return true;

  const role = auth.currentUser()?.role ?? 'developer';
  const routes: Record<string, string> = {
    admin: '/admin-dashboard',
    developer: '/developer-dashboard',
    client: '/client-dashboard',
  };
  return router.createUrlTree([routes[role] ?? '/dashboard']);
};

/** Admin-only guard. */
export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const toast  = inject(ToastService);

  if (!auth.isLoggedIn()) {
    toast.error('Please login to continue');
    return router.createUrlTree(['/login']);
  }
  if (auth.currentUser()?.role === 'admin') return true;

  toast.error('Access denied — Admins only');
  return router.createUrlTree(['/unauthorized']);
};

/** Developer-only guard (admin can also pass). */
export const developerGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const toast  = inject(ToastService);

  if (!auth.isLoggedIn()) {
    toast.error('Please login to continue');
    return router.createUrlTree(['/login']);
  }
  const role = auth.currentUser()?.role;
  if (role === 'admin' || role === 'developer') return true;

  toast.error('Access denied — Developers only');
  return router.createUrlTree(['/unauthorized']);
};

/** Client-only guard (admin can also pass). */
export const clientGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const toast  = inject(ToastService);

  if (!auth.isLoggedIn()) {
    toast.error('Please login to continue');
    return router.createUrlTree(['/login']);
  }
  const role = auth.currentUser()?.role;
  if (role === 'admin' || role === 'client') return true;

  toast.error('Access denied — Clients only');
  return router.createUrlTree(['/unauthorized']);
};
