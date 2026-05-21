import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../components/sidebar/sidebar';
import { ProjectService } from '../../services/project.service';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { Team } from '../../interfaces/project';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, Sidebar],
  templateUrl: './teams.html',
})
export class TeamsPage implements OnInit {
  projectSvc = inject(ProjectService);
  userSvc    = inject(UserService);
  toast      = inject(ToastService);

  loading = signal(true);

  readonly teamsWithMembers = computed(() =>
    this.projectSvc.teams().map(t => ({
      ...t,
      members: this.userSvc.users().filter(u => t.memberIds.includes(u.id)),
      lead: this.userSvc.users().find(u => u.id === t.leadId),
      projects: this.projectSvc.projects().filter(p => t.projectIds.includes(p.id)),
    }))
  );

  ngOnInit(): void {
    this.projectSvc.loadAll().subscribe(() => this.loading.set(false));
    this.userSvc.loadAll().subscribe();
  }

  getUserInitial(name: string): string { return name.charAt(0).toUpperCase(); }

  statusColor(s: string): string {
    const m: Record<string, string> = {
      in_progress: 'bg-amber-100 text-amber-800',
      planning: 'bg-blue-100 text-blue-800',
      completed: 'bg-emerald-100 text-emerald-800',
      on_hold: 'bg-slate-100 text-slate-600',
    };
    return m[s] ?? 'bg-slate-100 text-slate-600';
  }

  statusLabel(s: string): string {
    return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}
