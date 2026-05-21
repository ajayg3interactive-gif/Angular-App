import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { LoadingService } from '../services/loading.service';
import { ToastService } from '../services/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth    = inject(AuthService);
  const loading = inject(LoadingService);
  const toast   = inject(ToastService);

  loading.show();

  const token = auth.getCurrentUser()?.token;
  const modified = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(modified).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        toast.error('Session expired. Please login again.');
        auth.logout();
      } else if (err.status === 403) {
        toast.error('Access denied. You do not have permission.');
      } else if (err.status === 0) {
        toast.error('Cannot reach server. Is json-server running?');
      }
      return throwError(() => err);
    }),
    finalize(() => loading.hide()),
  );
};
