import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { AppNotification } from '../../interfaces/project';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink, Sidebar],
  templateUrl: './notifications.html',
})
export class NotificationsPage implements OnInit {
  auth      = inject(AuthService);
  notifSvc  = inject(NotificationService);

  loading = signal(true);

  readonly sorted = computed(() =>
    [...this.notifSvc.notifications()].sort((a, b) => b.created.localeCompare(a.created))
  );

  readonly unread = computed(() => this.sorted().filter(n => !n.read));
  readonly read   = computed(() => this.sorted().filter(n => n.read));

  ngOnInit(): void {
    const uid = this.auth.currentUser()?.id;
    if (uid) {
      this.notifSvc.loadForUser(uid).subscribe(() => this.loading.set(false));
    } else {
      this.loading.set(false);
    }
  }

  markRead(n: AppNotification): void {
    if (!n.read) this.notifSvc.markRead(n.id);
  }

  markAllRead(): void {
    const uid = this.auth.currentUser()?.id;
    if (uid) this.notifSvc.markAllRead(uid);
  }

  typeIcon(type: string): string {
    const icons: Record<string, string> = {
      success: '✅', info: 'ℹ️', warning: '⚠️', error: '❌',
    };
    return icons[type] ?? '🔔';
  }

  typeClass(type: string): string {
    const m: Record<string, string> = {
      success: 'bg-emerald-100 text-emerald-800',
      info:    'bg-blue-100 text-blue-800',
      warning: 'bg-amber-100 text-amber-800',
      error:   'bg-red-100 text-red-800',
    };
    return m[type] ?? 'bg-slate-100 text-slate-600';
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
