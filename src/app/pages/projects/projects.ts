import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { ToastService } from '../../services/toast.service';
import { Project, ProjectStatus, Priority } from '../../interfaces/project';
import { RbacService } from '../../services/rbac.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Sidebar],
  templateUrl: './projects.html',
})
export class ProjectsPage implements OnInit {
  auth       = inject(AuthService);
  projectSvc = inject(ProjectService);
  toast      = inject(ToastService);
  rbac       = inject(RbacService);

  loading      = signal(true);
  showModal    = signal(false);
  saving       = signal(false);
  searchQuery  = signal('');
  filterStatus = signal<ProjectStatus | ''>('');
  editTarget   = signal<Project | null>(null);

  form = signal({
    title: '',
    description: '',
    status: 'planning' as ProjectStatus,
    priority: 'medium' as Priority,
    budget: 0,
    startDate: '',
    endDate: '',
    tags: '',
  });

  readonly filtered = computed(() => {
    const q   = this.searchQuery().toLowerCase();
    const st  = this.filterStatus();
    const uid = this.auth.currentUser()?.id;
    const role = this.auth.currentUser()?.role;

    return this.projectSvc.projects()
      .filter(p => {
        if (role === 'developer') return true;  // admins & devs see all
        if (role === 'client') return p.clientId === uid;
        return true;
      })
      .filter(p => !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
      .filter(p => !st || p.status === st);
  });

  statuses: ProjectStatus[] = ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'];
  priorities: Priority[] = ['low', 'medium', 'high', 'critical'];

  ngOnInit(): void {
    this.projectSvc.loadProjects().subscribe(() => this.loading.set(false));
  }

  openCreate(): void {
    this.editTarget.set(null);
    this.form.set({ title: '', description: '', status: 'planning', priority: 'medium', budget: 0, startDate: '', endDate: '', tags: '' });
    this.showModal.set(true);
  }

  openEdit(p: Project): void {
    if (!this.rbac.isAdmin()) return;
    this.editTarget.set(p);
    this.form.set({ title: p.title, description: p.description, status: p.status, priority: p.priority, budget: p.budget, startDate: p.startDate, endDate: p.endDate, tags: p.tags.join(', ') });
    this.showModal.set(true);
  }

  save(): void {
    const f = this.form();
    if (!f.title.trim()) { this.toast.error('Project title is required'); return; }
    this.saving.set(true);

    const data = {
      title: f.title.trim(),
      description: f.description.trim(),
      status: f.status,
      priority: f.priority,
      budget: Number(f.budget),
      spent: 0,
      startDate: f.startDate,
      endDate: f.endDate,
      tags: f.tags.split(',').map(t => t.trim()).filter(Boolean),
      completion: 0,
      clientId: 4,
      teamId: 1,
      created: new Date().toISOString().split('T')[0],
    };

    const target = this.editTarget();
    const obs$ = target
      ? this.projectSvc.updateProject(target.id, data)
      : this.projectSvc.createProject(data);

    obs$.subscribe({
      next: () => {
        this.toast.success(target ? 'Project updated' : 'Project created');
        this.showModal.set(false);
        this.saving.set(false);
      },
      error: () => { this.toast.error('Failed to save project'); this.saving.set(false); },
    });
  }

  delete(p: Project): void {
    if (!this.rbac.isAdmin()) return;
    if (!confirm(`Delete "${p.title}"?`)) return;
    this.projectSvc.deleteProject(p.id).subscribe({
      next: () => this.toast.success('Project deleted'),
      error: () => this.toast.error('Failed to delete'),
    });
  }

  statusLabel(s: string): string { return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }

  statusColor(s: string): string {
    const m: Record<string, string> = {
      in_progress: 'bg-amber-100 text-amber-800',
      planning: 'bg-blue-100 text-blue-800',
      completed: 'bg-emerald-100 text-emerald-800',
      on_hold: 'bg-slate-100 text-slate-600',
      cancelled: 'bg-red-100 text-red-700',
    };
    return m[s] ?? 'bg-slate-100 text-slate-600';
  }

  priorityDot(p: Priority): string {
    const m: Record<Priority, string> = { low: 'bg-slate-400', medium: 'bg-amber-400', high: 'bg-red-500', critical: 'bg-red-700' };
    return m[p];
  }

  budgetPct(p: Project): number { return p.budget > 0 ? Math.min(100, Math.round((p.spent / p.budget) * 100)) : 0; }
}
