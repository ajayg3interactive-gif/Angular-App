import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { PRIORITY_CONFIG, CARD_COLUMNS } from '../../interfaces/project';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, Sidebar],
  templateUrl: './admin-dashboard.html',
})
export class AdminDashboard implements OnInit {
  auth        = inject(AuthService);
  projectSvc  = inject(ProjectService);
  userSvc     = inject(UserService);
  notifSvc    = inject(NotificationService);

  loading = signal(true);

  readonly totalRevenue = computed(() =>
    this.projectSvc.projects().reduce((s, p) => s + p.spent, 0)
  );

  readonly totalBudget = computed(() =>
    this.projectSvc.projects().reduce((s, p) => s + p.budget, 0)
  );

  readonly pendingCards = computed(() =>
    this.projectSvc.cards().filter(c => !['completed', 'delivered'].includes(c.status)).length
  );

  readonly overdueTasks = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.projectSvc.cards().filter(c =>
      c.dueDate < today && !['completed', 'delivered'].includes(c.status)
    ).length;
  });

  readonly recentProjects = computed(() =>
    [...this.projectSvc.projects()].sort((a, b) => b.created.localeCompare(a.created)).slice(0, 5)
  );

  readonly recentCards = computed(() =>
    [...this.projectSvc.cards()]
      .filter(c => !['completed', 'delivered'].includes(c.status))
      .sort((a, b) => b.created.localeCompare(a.created))
      .slice(0, 5)
  );

  readonly statusStats = computed(() => {
    const cards = this.projectSvc.cards();
    const total = cards.length || 1;
    return CARD_COLUMNS.map(col => ({
      ...col,
      count: cards.filter(c => c.status === col.key).length,
      pct: Math.round((cards.filter(c => c.status === col.key).length / total) * 100),
    }));
  });

  readonly developerUsers = computed(() =>
    this.userSvc.users().filter(u => u.role === 'developer')
  );

  readonly clientUsers = computed(() =>
    this.userSvc.users().filter(u => u.role === 'client')
  );

  priorityConfig = PRIORITY_CONFIG;

  ngOnInit(): void {
    this.projectSvc.loadAll().subscribe(() => this.loading.set(false));
    this.userSvc.loadAll().subscribe();
    const uid = this.auth.currentUser()?.id;
    if (uid) this.notifSvc.loadForUser(uid).subscribe();
  }

  formatCurrency(n: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  }

  statusLabel(s: string): string {
    return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  statusColor(s: string): string {
    const map: Record<string, string> = {
      in_progress: 'bg-amber-100 text-amber-800',
      planning: 'bg-blue-100 text-blue-800',
      completed: 'bg-emerald-100 text-emerald-800',
      on_hold: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return map[s] ?? 'bg-slate-100 text-slate-600';
  }
}
