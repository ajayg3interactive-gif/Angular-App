import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../components/sidebar/sidebar';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-my-projects',
  standalone: true,
  imports: [CommonModule, Sidebar],
  templateUrl: './my-projects.html',
})
export class MyProjectsPage implements OnInit {
  auth       = inject(AuthService);
  projectSvc = inject(ProjectService);

  loading = signal(true);

  readonly myProjects = computed(() => {
    const uid = this.auth.currentUser()?.id;
    return this.projectSvc.projects().filter(p => p.clientId === uid);
  });

  readonly myMilestones = computed(() => {
    const pids = new Set(this.myProjects().map(p => p.id));
    return this.projectSvc.milestones().filter(m => pids.has(m.projectId));
  });

  getProjectMilestones(projectId: number) {
    return this.myMilestones().filter(m => m.projectId === projectId);
  }

  ngOnInit(): void {
    this.projectSvc.loadAll().subscribe(() => this.loading.set(false));
  }

  statusLabel(s: string): string { return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }

  statusColor(s: string): string {
    const m: Record<string, string> = {
      in_progress: 'bg-amber-100 text-amber-800',
      planning: 'bg-blue-100 text-blue-800',
      completed: 'bg-emerald-100 text-emerald-800',
      on_hold: 'bg-slate-100 text-slate-600',
      pending: 'bg-slate-100 text-slate-600',
    };
    return m[s] ?? 'bg-slate-100 text-slate-600';
  }

  milestoneIcon(s: string): string {
    return s === 'completed' ? '✅' : s === 'in_progress' ? '🔄' : '⏳';
  }

  formatCurrency(n: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  }
}
