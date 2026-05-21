import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, Sidebar],
  templateUrl: './client-dashboard.html',
})
export class ClientDashboard implements OnInit {
  auth       = inject(AuthService);
  projectSvc = inject(ProjectService);
  notifSvc   = inject(NotificationService);

  loading = signal(true);

  readonly myProjects = computed(() => {
    const uid = this.auth.currentUser()?.id;
    return this.projectSvc.projects().filter(p => p.clientId === uid);
  });

  readonly activeProjects = computed(() =>
    this.myProjects().filter(p => p.status === 'in_progress')
  );

  readonly completedProjects = computed(() =>
    this.myProjects().filter(p => p.status === 'completed')
  );

  readonly avgCompletion = computed(() => {
    const ps = this.myProjects();
    if (!ps.length) return 0;
    return Math.round(ps.reduce((s, p) => s + p.completion, 0) / ps.length);
  });

  readonly myMilestones = computed(() => {
    const pids = new Set(this.myProjects().map(p => p.id));
    return this.projectSvc.milestones().filter(m => pids.has(m.projectId));
  });

  readonly upcomingMilestones = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    const soon  = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    return this.myMilestones()
      .filter(m => m.dueDate >= today && m.dueDate <= soon && m.status !== 'completed')
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  });

  readonly recentActivity = computed(() =>
    this.myProjects().slice(0, 4)
  );

  ngOnInit(): void {
    this.projectSvc.loadAll().subscribe(() => this.loading.set(false));
    const uid = this.auth.currentUser()?.id;
    if (uid) this.notifSvc.loadForUser(uid).subscribe();
  }

  statusLabel(s: string): string {
    return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  statusColor(s: string): string {
    const m: Record<string, string> = {
      in_progress: 'bg-amber-100 text-amber-800',
      planning: 'bg-blue-100 text-blue-800',
      completed: 'bg-emerald-100 text-emerald-800',
      on_hold: 'bg-slate-100 text-slate-600',
    };
    return m[s] ?? 'bg-slate-100 text-slate-600';
  }

  milestoneStatusColor(s: string): string {
    const m: Record<string, string> = {
      completed: 'text-emerald-500',
      in_progress: 'text-amber-500',
      pending: 'text-slate-400',
    };
    return m[s] ?? 'text-slate-400';
  }
}
