import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, forkJoin } from 'rxjs';
import { Project, Card, Team, Milestone, ActivityLog, CardStatus } from '../interfaces/project';

const API = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);

  private _projects  = signal<Project[]>([]);
  private _cards     = signal<Card[]>([]);
  private _teams     = signal<Team[]>([]);
  private _milestones = signal<Milestone[]>([]);
  private _logs      = signal<ActivityLog[]>([]);

  readonly projects   = this._projects.asReadonly();
  readonly cards      = this._cards.asReadonly();
  readonly teams      = this._teams.asReadonly();
  readonly milestones = this._milestones.asReadonly();
  readonly logs       = this._logs.asReadonly();

  readonly totalProjects  = computed(() => this._projects().length);
  readonly activeProjects = computed(() => this._projects().filter(p => p.status === 'in_progress').length);
  readonly completedProjects = computed(() => this._projects().filter(p => p.status === 'completed').length);
  readonly totalCards     = computed(() => this._cards().length);
  readonly openCards      = computed(() => this._cards().filter(c => !['completed','delivered'].includes(c.status)).length);

  loadAll(): Observable<[Project[], Card[], Team[], Milestone[]]> {
    return forkJoin([
      this.http.get<Project[]>(`${API}/projects`),
      this.http.get<Card[]>(`${API}/cards`),
      this.http.get<Team[]>(`${API}/teams`),
      this.http.get<Milestone[]>(`${API}/milestones`),
    ]).pipe(
      tap(([projects, cards, teams, milestones]) => {
        this._projects.set(projects);
        this._cards.set(cards);
        this._teams.set(teams);
        this._milestones.set(milestones);
      })
    );
  }

  loadProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${API}/projects`).pipe(
      tap(p => this._projects.set(p))
    );
  }

  loadCards(projectId?: number): Observable<Card[]> {
    const url = projectId ? `${API}/cards?projectId=${projectId}` : `${API}/cards`;
    return this.http.get<Card[]>(url).pipe(tap(c => this._cards.set(c)));
  }

  loadTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(`${API}/teams`).pipe(tap(t => this._teams.set(t)));
  }

  loadLogs(): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(`${API}/activity_logs`).pipe(tap(l => this._logs.set(l)));
  }

  /* ── Projects ── */
  createProject(data: Omit<Project, 'id'>): Observable<Project> {
    return this.http.post<Project>(`${API}/projects`, data).pipe(
      tap(p => this._projects.update(list => [...list, p]))
    );
  }

  updateProject(id: number, updates: Partial<Project>): Observable<Project> {
    return this.http.patch<Project>(`${API}/projects/${id}`, updates).pipe(
      tap(p => this._projects.update(list => list.map(x => x.id === id ? p : x)))
    );
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/projects/${id}`).pipe(
      tap(() => this._projects.update(list => list.filter(p => p.id !== id)))
    );
  }

  /* ── Cards ── */
  createCard(data: Omit<Card, 'id'>): Observable<Card> {
    return this.http.post<Card>(`${API}/cards`, data).pipe(
      tap(c => this._cards.update(list => [...list, c]))
    );
  }

  updateCard(id: number, updates: Partial<Card>): Observable<Card> {
    return this.http.patch<Card>(`${API}/cards/${id}`, updates).pipe(
      tap(c => this._cards.update(list => list.map(x => x.id === id ? c : x)))
    );
  }

  moveCard(id: number, status: CardStatus): Observable<Card> {
    return this.updateCard(id, { status });
  }

  deleteCard(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/cards/${id}`).pipe(
      tap(() => this._cards.update(list => list.filter(c => c.id !== id)))
    );
  }

  /* ── Teams ── */
  createTeam(data: Omit<Team, 'id'>): Observable<Team> {
    return this.http.post<Team>(`${API}/teams`, data).pipe(
      tap(t => this._teams.update(list => [...list, t]))
    );
  }

  updateTeam(id: number, updates: Partial<Team>): Observable<Team> {
    return this.http.patch<Team>(`${API}/teams/${id}`, updates).pipe(
      tap(t => this._teams.update(list => list.map(x => x.id === id ? t : x)))
    );
  }

  /* ── Helpers ── */
  getCardsByStatus(status: CardStatus): Card[] {
    return this._cards().filter(c => c.status === status);
  }

  getCardsByProject(projectId: number): Card[] {
    return this._cards().filter(c => c.projectId === projectId);
  }

  getCardsByAssignee(userId: number): Card[] {
    return this._cards().filter(c => c.assignedTo.includes(userId));
  }

  getProjectsByClient(clientId: number): Project[] {
    return this._projects().filter(p => p.clientId === clientId);
  }
}
