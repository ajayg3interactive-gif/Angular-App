import { Injectable, inject, computed } from '@angular/core';
import { AuthService } from './auth.service';
import { Permission, ROLE_DEFINITIONS } from '../interfaces/rbac';
import { UserRole } from '../interfaces/user';

@Injectable({ providedIn: 'root' })
export class RbacService {
  private auth = inject(AuthService);

  readonly currentRole = computed(() => this.auth.currentUser()?.role as UserRole | undefined);
  readonly isAdmin     = computed(() => this.currentRole() === 'admin');
  readonly isDeveloper = computed(() => this.currentRole() === 'developer');
  readonly isClient    = computed(() => this.currentRole() === 'client');

  readonly roleLabel = computed(() => {
    const role = this.currentRole();
    return role ? ROLE_DEFINITIONS[role]?.label ?? role : '';
  });

  readonly defaultRoute = computed(() => {
    const role = this.currentRole();
    return role ? ROLE_DEFINITIONS[role]?.defaultRoute ?? '/dashboard' : '/login';
  });

  hasRole(...roles: UserRole[]): boolean {
    const role = this.currentRole();
    return role ? roles.includes(role) : false;
  }

  hasPermission(permission: Permission): boolean {
    const role = this.currentRole();
    if (!role) return false;
    const def = ROLE_DEFINITIONS[role];
    if (!def) return false;
    return (def.permissions as string[]).includes('*') || (def.permissions as string[]).includes(permission);
  }

  canAccessAdmin(): boolean   { return this.isAdmin(); }
  canAccessDeveloper(): boolean { return this.isAdmin() || this.isDeveloper(); }
  canAccessClient(): boolean   { return this.isAdmin() || this.isClient(); }
}
