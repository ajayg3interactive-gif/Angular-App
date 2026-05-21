import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AppNotification } from '../interfaces/project';

const API = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);

  private _notifications = signal<AppNotification[]>([]);

  readonly notifications  = this._notifications.asReadonly();
  readonly unreadCount    = computed(() => this._notifications().filter(n => !n.read).length);

  loadForUser(userId: number): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${API}/notifications?userId=${userId}`).pipe(
      tap(n => this._notifications.set(n))
    );
  }

  markRead(id: number): void {
    this.http.patch<AppNotification>(`${API}/notifications/${id}`, { read: true })
      .subscribe(n => this._notifications.update(list => list.map(x => x.id === id ? n : x)));
  }

  markAllRead(userId: number): void {
    const unread = this._notifications().filter(n => !n.read && n.userId === userId);
    unread.forEach(n => this.markRead(n.id));
  }

  addNotification(data: Omit<AppNotification, 'id'>): Observable<AppNotification> {
    return this.http.post<AppNotification>(`${API}/notifications`, data).pipe(
      tap(n => this._notifications.update(list => [n, ...list]))
    );
  }
}
