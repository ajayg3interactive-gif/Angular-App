import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/** Protects routes that require authentication. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth  = inject(AuthService);
  const router = inject(Router);
  const toast  = inject(ToastService);

  if (auth.isLoggedIn()) {
    return true;
  }

  toast.error('Please login to continue');
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};

/** Prevents logged-in users from accessing login / signup. */
export const guestGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
