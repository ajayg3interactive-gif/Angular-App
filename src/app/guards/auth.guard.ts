import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, take, map } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

function waitForAuth() {
  const auth = inject(AuthService);
  return toObservable(auth.initialized).pipe(filter(Boolean), take(1));
}

/** Requires any authenticated user. */
export const authGuard: CanActivateFn = (_route, state) => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;

  const auth   = inject(AuthService);
  const router = inject(Router);
  const toast  = inject(ToastService);

  return waitForAuth().pipe(
    map(() => {
      if (auth.isLoggedIn()) return true;
      toast.error('Please login to continue');
      return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    })
  );
};

/** Prevents logged-in users from accessing login / signup. */
export const guestGuard: CanActivateFn = () => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;

  const auth   = inject(AuthService);
  const router = inject(Router);

  return waitForAuth().pipe(
    map(() => {
      if (!auth.isLoggedIn()) return true;
      const role = auth.currentUser()?.role ?? 'developer';
      const routes: Record<string, string> = {
        admin:     '/admin-dashboard',
        developer: '/developer-dashboard',
        client:    '/client-dashboard',
      };
      return router.createUrlTree([routes[role] ?? '/dashboard']);
    })
  );
};

/** Admin-only guard. */
export const adminGuard: CanActivateFn = () => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;

  const auth   = inject(AuthService);
  const router = inject(Router);
  const toast  = inject(ToastService);

  return waitForAuth().pipe(
    map(() => {
      if (!auth.isLoggedIn()) {
        toast.error('Please login to continue');
        return router.createUrlTree(['/login']);
      }
      if (auth.currentUser()?.role === 'admin') return true;
      toast.error('Access denied — Admins only');
      return router.createUrlTree(['/unauthorized']);
    })
  );
};

/** Developer-only guard (admin can also pass). */
export const developerGuard: CanActivateFn = () => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;

  const auth   = inject(AuthService);
  const router = inject(Router);
  const toast  = inject(ToastService);

  return waitForAuth().pipe(
    map(() => {
      if (!auth.isLoggedIn()) {
        toast.error('Please login to continue');
        return router.createUrlTree(['/login']);
      }
      const role = auth.currentUser()?.role;
      if (role === 'admin' || role === 'developer') return true;
      toast.error('Access denied — Developers only');
      return router.createUrlTree(['/unauthorized']);
    })
  );
};

/** Client-only guard (admin can also pass). */
export const clientGuard: CanActivateFn = () => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;

  const auth   = inject(AuthService);
  const router = inject(Router);
  const toast  = inject(ToastService);

  return waitForAuth().pipe(
    map(() => {
      if (!auth.isLoggedIn()) {
        toast.error('Please login to continue');
        return router.createUrlTree(['/login']);
      }
      const role = auth.currentUser()?.role;
      if (role === 'admin' || role === 'client') return true;
      toast.error('Access denied — Clients only');
      return router.createUrlTree(['/unauthorized']);
    })
  );
};
