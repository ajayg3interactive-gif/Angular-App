import { Component } from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';
import { DashboardCards } from '../../components/dashboard-cards/dashboard-cards';
import { UserTable } from '../../components/user-table/user-table';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Sidebar, DashboardCards, UserTable],
  templateUrl: './dashboard.html',
})
export class Dashboard {}
