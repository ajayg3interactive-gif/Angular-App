import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  templateUrl: './unauthorized.html',
})
export class UnauthorizedPage {
  private router = inject(Router);
  auth = inject(AuthService);

  goBack(): void {
    this.auth.navigateToDashboard();
  }

  logout(): void {
    this.auth.logout();
  }
}
