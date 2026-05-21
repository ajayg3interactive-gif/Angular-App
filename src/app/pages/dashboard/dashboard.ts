import { Component, inject, OnInit } from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';
import { DashboardCards } from '../../components/dashboard-cards/dashboard-cards';
import { UserTable } from '../../components/user-table/user-table';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Sidebar, DashboardCards, UserTable],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  auth        = inject(AuthService);
  userService = inject(UserService);

  ngOnInit(): void {
    this.userService.loadAll().subscribe();
  }

  get userInitial(): string {
    return (this.auth.currentUser()?.name ?? 'A').charAt(0).toUpperCase();
  }
}
