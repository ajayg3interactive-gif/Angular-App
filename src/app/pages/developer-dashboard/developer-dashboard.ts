import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { NotificationService } from '../../services/notification.service';
import { PRIORITY_CONFIG, CARD_COLUMNS } from '../../interfaces/project';

@Component({
  selector: 'app-developer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, Sidebar],
  templateUrl: './developer-dashboard.html',
})
export class DeveloperDashboard implements OnInit {
  auth       = inject(AuthService);
  projectSvc = inject(ProjectService);
  notifSvc   = inject(NotificationService);

  loading  = signal(true);
  priorityConfig = PRIORITY_CONFIG;
  columns = CARD_COLUMNS;

  readonly myCards = computed(() => {
    const uid = this.auth.currentUser()?.id;
    return this.projectSvc.cards().filter(c => uid != null && c.assignedTo.includes(uid));
  });

  readonly activeTasks = computed(() =>
    this.myCards().filter(c => !['completed', 'delivered'].includes(c.status))
  );

  readonly completedTasks = computed(() =>
    this.myCards().filter(c => ['completed', 'delivered'].includes(c.status))
  );

  readonly upcomingDeadlines = computed(() => {
    const today = new Date();
    const soon  = new Date(today.getTime() + 7 * 86400000).toISOString().split('T')[0];
    return this.myCards()
      .filter(c => c.dueDate <= soon && !['completed','delivered'].includes(c.status))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  });

  readonly overdueCount = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.myCards().filter(c => c.dueDate < today && !['completed','delivered'].includes(c.status)).length;
  });

  readonly totalHoursLogged = computed(() =>
    this.myCards().reduce((s, c) => s + c.loggedHours, 0)
  );

  readonly inProgressCards = computed(() =>
    this.myCards().filter(c => c.status === 'in_progress')
  );

  readonly reviewCards = computed(() =>
    this.myCards().filter(c => c.status === 'review' || c.status === 'testing')
  );

  readonly activeProjects = computed(() => {
    const pids = new Set(this.myCards().map(c => c.projectId));
    return this.projectSvc.projects().filter(p => pids.has(p.id));
  });

  ngOnInit(): void {
    this.projectSvc.loadAll().subscribe(() => this.loading.set(false));
    const uid = this.auth.currentUser()?.id;
    if (uid) this.notifSvc.loadForUser(uid).subscribe();
  }

  statusColor(s: string): string {
    const m: Record<string, string> = {
      in_progress: 'bg-amber-100 text-amber-800',
      testing: 'bg-purple-100 text-purple-800',
      review: 'bg-cyan-100 text-cyan-800',
      todo: 'bg-blue-100 text-blue-800',
      backlog: 'bg-slate-100 text-slate-600',
      completed: 'bg-emerald-100 text-emerald-800',
    };
    return m[s] ?? 'bg-slate-100 text-slate-600';
  }

  statusLabel(s: string): string {
    return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  isOverdue(dueDate: string): boolean {
    return dueDate < new Date().toISOString().split('T')[0];
  }
}
