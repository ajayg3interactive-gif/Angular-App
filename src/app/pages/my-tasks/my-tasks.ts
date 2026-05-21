import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../components/sidebar/sidebar';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { ToastService } from '../../services/toast.service';
import { Card, CardStatus, PRIORITY_CONFIG, CARD_COLUMNS } from '../../interfaces/project';

@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './my-tasks.html',
})
export class MyTasksPage implements OnInit {
  auth       = inject(AuthService);
  projectSvc = inject(ProjectService);
  toast      = inject(ToastService);

  loading      = signal(true);
  filterStatus = signal<CardStatus | ''>('');
  searchQuery  = signal('');
  priorityConfig = PRIORITY_CONFIG;
  columns = CARD_COLUMNS;

  readonly myCards = computed(() => {
    const uid = this.auth.currentUser()?.id;
    return this.projectSvc.cards().filter(c => uid != null && c.assignedTo.includes(uid));
  });

  readonly filtered = computed(() => {
    const q  = this.searchQuery().toLowerCase();
    const st = this.filterStatus();
    return this.myCards()
      .filter(c => !q || c.title.toLowerCase().includes(q))
      .filter(c => !st || c.status === st);
  });

  readonly stats = computed(() => ({
    total: this.myCards().length,
    active: this.myCards().filter(c => !['completed','delivered'].includes(c.status)).length,
    completed: this.myCards().filter(c => ['completed','delivered'].includes(c.status)).length,
    overdue: this.myCards().filter(c => c.dueDate < new Date().toISOString().split('T')[0] && !['completed','delivered'].includes(c.status)).length,
    hoursLogged: this.myCards().reduce((s, c) => s + c.loggedHours, 0),
    hoursEstimated: this.myCards().reduce((s, c) => s + c.estimatedHours, 0),
  }));

  ngOnInit(): void {
    this.projectSvc.loadAll().subscribe(() => this.loading.set(false));
  }

  updateStatus(card: Card, status: CardStatus): void {
    this.projectSvc.moveCard(card.id, status).subscribe({
      next: () => this.toast.success(`Status updated to ${status}`),
      error: () => this.toast.error('Failed to update status'),
    });
  }

  getProjectName(id: number): string {
    return this.projectSvc.projects().find(p => p.id === id)?.title ?? 'Unknown';
  }

  isOverdue(dueDate: string): boolean {
    return !!dueDate && dueDate < new Date().toISOString().split('T')[0];
  }

  statusLabel(s: string): string { return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }

  statusColor(s: string): string {
    const m: Record<string, string> = {
      in_progress: 'bg-amber-100 text-amber-800',
      testing: 'bg-purple-100 text-purple-800',
      review: 'bg-cyan-100 text-cyan-800',
      todo: 'bg-blue-100 text-blue-800',
      backlog: 'bg-slate-100 text-slate-600',
      completed: 'bg-emerald-100 text-emerald-800',
      delivered: 'bg-indigo-100 text-indigo-800',
    };
    return m[s] ?? 'bg-slate-100 text-slate-600';
  }
}
