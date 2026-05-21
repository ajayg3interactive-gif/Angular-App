import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../components/sidebar/sidebar';
import { ProjectService } from '../../services/project.service';
import { UserService } from '../../services/user.service';
import { CARD_COLUMNS, PRIORITY_CONFIG } from '../../interfaces/project';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, Sidebar],
  templateUrl: './analytics.html',
})
export class AnalyticsPage implements OnInit {
  protected Math = Math;
  projectSvc = inject(ProjectService);
  userSvc    = inject(UserService);

  loading = signal(true);
  columns = CARD_COLUMNS;
  priorityConfig = PRIORITY_CONFIG;

  readonly totalBudget     = computed(() => this.projectSvc.projects().reduce((s, p) => s + p.budget, 0));
  readonly totalSpent      = computed(() => this.projectSvc.projects().reduce((s, p) => s + p.spent, 0));
  readonly budgetRemaining = computed(() => this.totalBudget() - this.totalSpent());
  readonly budgetPct       = computed(() => this.totalBudget() > 0 ? Math.round((this.totalSpent() / this.totalBudget()) * 100) : 0);

  readonly projectsByStatus = computed(() => {
    const groups: Record<string, number> = {};
    this.projectSvc.projects().forEach(p => { groups[p.status] = (groups[p.status] ?? 0) + 1; });
    return Object.entries(groups).map(([status, count]) => ({ status, count }));
  });

  readonly cardsByStatus = computed(() => {
    const total = this.projectSvc.cards().length || 1;
    return this.columns.map(col => ({
      ...col,
      count: this.projectSvc.cards().filter(c => c.status === col.key).length,
      pct: Math.round((this.projectSvc.cards().filter(c => c.status === col.key).length / total) * 100),
    }));
  });

  readonly cardsByPriority = computed(() => {
    const cards = this.projectSvc.cards();
    const total = cards.length || 1;
    return ['low','medium','high','critical'].map(p => ({
      priority: p,
      count: cards.filter(c => c.priority === p).length,
      pct: Math.round((cards.filter(c => c.priority === p).length / total) * 100),
      config: this.priorityConfig[p as keyof typeof this.priorityConfig],
    }));
  });

  readonly developerWorkload = computed(() => {
    const devs = this.userSvc.users().filter(u => u.role === 'developer');
    const cards = this.projectSvc.cards();
    return devs.map(d => ({
      ...d,
      total: cards.filter(c => c.assignedTo.includes(d.id)).length,
      active: cards.filter(c => c.assignedTo.includes(d.id) && !['completed','delivered'].includes(c.status)).length,
      completed: cards.filter(c => c.assignedTo.includes(d.id) && ['completed','delivered'].includes(c.status)).length,
      hoursLogged: cards.filter(c => c.assignedTo.includes(d.id)).reduce((s, c) => s + c.loggedHours, 0),
    }));
  });

  readonly topProjects = computed(() =>
    [...this.projectSvc.projects()].sort((a, b) => b.completion - a.completion).slice(0, 5)
  );

  ngOnInit(): void {
    this.projectSvc.loadAll().subscribe(() => this.loading.set(false));
    this.userSvc.loadAll().subscribe();
  }

  formatCurrency(n: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  }

  statusLabel(s: string): string { return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }

  statusColor(s: string): string {
    const m: Record<string, string> = {
      in_progress: 'bg-amber-100 text-amber-800',
      planning: 'bg-blue-100 text-blue-800',
      completed: 'bg-emerald-100 text-emerald-800',
      on_hold: 'bg-slate-100 text-slate-600',
    };
    return m[s] ?? 'bg-slate-100 text-slate-600';
  }
}
