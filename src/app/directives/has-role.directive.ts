import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { RbacService } from '../services/rbac.service';
import { UserRole } from '../interfaces/user';

/**
 * Structural directive — renders the element only when the logged-in user
 * has one of the specified roles.
 *
 * Usage:
 *   <div *appHasRole="'admin'">Admin only</div>
 *   <div *appHasRole="['admin','developer']">Admin or Dev</div>
 */
@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective {
  private vcr   = inject(ViewContainerRef);
  private tmpl  = inject(TemplateRef<unknown>);
  private rbac  = inject(RbacService);

  private roles: UserRole[] = [];
  private created = false;

  constructor() {
    effect(() => {
      this.rbac.currentRole(); // subscribe to role changes
      this.updateView();
    });
  }

  @Input() set appHasRole(roles: UserRole | UserRole[]) {
    this.roles = Array.isArray(roles) ? roles : [roles];
    this.updateView();
  }

  private updateView(): void {
    const allowed = this.roles.length === 0 || this.rbac.hasRole(...this.roles);
    if (allowed && !this.created) {
      this.vcr.createEmbeddedView(this.tmpl);
      this.created = true;
    } else if (!allowed && this.created) {
      this.vcr.clear();
      this.created = false;
    }
  }
}
