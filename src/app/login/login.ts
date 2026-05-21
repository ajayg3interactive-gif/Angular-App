import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb          = inject(FormBuilder);
  private router      = inject(Router);
  private route       = inject(ActivatedRoute);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  loginForm: FormGroup = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loginMessage: { type: 'success' | 'error'; text: string } | null = null;
  showPassword = false;
  isSubmitting = false;

  get email()    { return this.loginForm.get('email')!; }
  get password() { return this.loginForm.get('password')!; }

  emailInputClass(): string {
    const base = 'w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all duration-200';
    return this.email.invalid && this.email.touched
      ? `${base} border-red-300 bg-red-50`
      : `${base} border-gray-200 focus:border-indigo-400 bg-white`;
  }

  passwordInputClass(): string {
    const base = 'w-full pl-10 pr-10 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all duration-200';
    return this.password.invalid && this.password.touched
      ? `${base} border-red-300 bg-red-50`
      : `${base} border-gray-200 focus:border-indigo-400 bg-white`;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.loginMessage = null;

    const { email, password } = this.loginForm.value as { email: string; password: string };

    this.userService.authenticate(email, password).subscribe({
      next: (users) => {
        if (users.length > 0) {
          // Persist session via AuthService
          this.authService.login(users[0]);
          this.loginMessage = { type: 'success', text: 'Login successful! Redirecting…' };

          // Redirect to originally requested URL, otherwise role-based dashboard
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          setTimeout(() => {
            if (returnUrl && returnUrl !== '/dashboard') {
              this.router.navigateByUrl(returnUrl);
            } else {
              this.authService.navigateToDashboard();
            }
          }, 800);
        } else {
          this.loginMessage = { type: 'error', text: 'Invalid email or password. Please try again.' };
          this.isSubmitting = false;
        }
      },
      error: () => {
        this.loginMessage = { type: 'error', text: 'Server error. Is json-server running?' };
        this.isSubmitting = false;
      },
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
