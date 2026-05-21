import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ROLE_DEFINITIONS } from '../../interfaces/rbac';

/** Smart redirect — sends users to their role-specific dashboard. */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `<div class="flex items-center justify-center min-h-screen bg-slate-900">
    <div class="text-white text-center">
      <div class="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p class="text-slate-400 text-sm">Redirecting to your dashboard...</p>
    </div>
  </div>`,
})
export class Dashboard implements OnInit {
  private router = inject(Router);
  private auth   = inject(AuthService);

  ngOnInit(): void {
    const role  = this.auth.currentUser()?.role ?? 'developer';
    const route = ROLE_DEFINITIONS[role as keyof typeof ROLE_DEFINITIONS]?.defaultRoute ?? '/login';
    this.router.navigate([route], { replaceUrl: true });
  }
}
