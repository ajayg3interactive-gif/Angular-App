import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User, UserRole } from '../interfaces/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/users';

  private _users = signal<User[]>([]);

  readonly users = this._users.asReadonly();
  readonly totalUsers = computed(() => this._users().length);
  readonly activeUsers = computed(() => this._users().filter(u => u.status === 'active').length);
  readonly inactiveUsers = computed(() => this._users().filter(u => u.status !== 'active').length);

  loadAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      tap(users => this._users.set(users))
    );
  }

  // POST /users — registers a new user account
  register(name: string, email: string, password: string): Observable<User> {
    const today = new Date().toISOString().split('T')[0];
    return this.http.post<User>(this.apiUrl, {
      name, email, password, status: 'active', created: today
    });
  }

  // GET /users?email=<email> — check if email is already taken
  checkEmailExists(email: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}?email=${encodeURIComponent(email)}`);
  }

  // GET /users?email=<email>&password=<password> — validate login credentials
  authenticate(email: string, password: string): Observable<User[]> {
    return this.http.get<User[]>(
      `${this.apiUrl}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    );
  }

  // POST /users — json-server auto-assigns the id
 addUser(name: string, email: string, status: 'active' | 'inactive', role: UserRole): void {
  const today = new Date().toISOString().split('T')[0];
  this.http
    .post<User>(this.apiUrl, { name, email, password: '', role, status, created: today })
    .subscribe(created => this._users.update(list => [...list, created]));
}

  // PATCH /users/:id — partial update (only the changed fields)
  editUser(id: number, updates: Partial<Omit<User, 'id'>>): void {
    this.http
      .patch<User>(`${this.apiUrl}/${id}`, updates)
      .subscribe(updated =>
        this._users.update(list => list.map(u => u.id === id ? updated : u))
      );
  }

  // DELETE /users/:id
  deleteUser(id: number): void {
    this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .subscribe(() =>
        this._users.update(list => list.filter(u => u.id !== id))
      );
  }

  // PATCH /users/:id — flip status only
  toggleStatus(id: number): void {
    const user = this._users().find(u => u.id === id);
    if (!user) return;
    const status: 'active' | 'inactive' = user.status === 'active' ? 'inactive' : 'active';
    this.http
      .patch<User>(`${this.apiUrl}/${id}`, { status })
      .subscribe(updated =>
        this._users.update(list => list.map(u => u.id === id ? updated : u))
      );
  }
}
