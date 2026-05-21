import { Component, inject, computed } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-dashboard-cards',
  standalone: true,
  templateUrl: './dashboard-cards.html',
})
export class DashboardCards {
  userService = inject(UserService);

  activePercent = computed(() => {
    const total = this.userService.totalUsers();
    return total > 0 ? Math.round((this.userService.activeUsers() / total) * 100) : 0;
  });

  inactivePercent = computed(() => {
    const total = this.userService.totalUsers();
    return total > 0 ? Math.round((this.userService.inactiveUsers() / total) * 100) : 0;
  });
}
