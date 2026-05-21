import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user';
import { Sidebar } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [Sidebar],
  templateUrl: './users-page.html',
})
export class UsersPage implements OnInit {
  private userService = inject(UserService);
  auth = inject(AuthService);

  get userInitial(): string {
    return (this.auth.currentUser()?.name ?? 'A').charAt(0).toUpperCase();
  }

  readonly totalUsers    = this.userService.totalUsers;
  readonly activeUsers   = this.userService.activeUsers;
  readonly inactiveUsers = this.userService.inactiveUsers;

  readonly pageSize = 8;
  searchQuery  = signal('');
  currentPage  = signal(1);

  filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.userService.users();
    return this.userService.users().filter(
      u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  });

  paginatedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredUsers().slice(start, start + this.pageSize);
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredUsers().length / this.pageSize))
  );

  pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  isModalOpen  = signal(false);
  isEditMode   = signal(false);
  editingId    = signal<number | null>(null);

  // Form signals — formIsActive is a boolean for the toggle UI
  formName     = signal('');
  formEmail    = signal('');
  formIsActive = signal(true);

  ngOnInit(): void {
    this.userService.loadAll().subscribe();
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  openAddModal(): void {
    this.isEditMode.set(false);
    this.editingId.set(null);
    this.formName.set('');
    this.formEmail.set('');
    this.formIsActive.set(true);
    this.isModalOpen.set(true);
  }

  openEditModal(user: User): void {
    this.isEditMode.set(true);
    this.editingId.set(user.id);
    this.formName.set(user.name);
    this.formEmail.set(user.email);
    this.formIsActive.set(user.status === 'active');
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  saveUser(): void {
    const name   = this.formName().trim();
    const email  = this.formEmail().trim();
    const status: 'active' | 'inactive' = this.formIsActive() ? 'active' : 'inactive';
    if (!name || !email) return;

    if (this.isEditMode()) {
      const id = this.editingId();
      if (id !== null) {
        this.userService.editUser(id, { name, email, status });
      }
    } else {
      this.userService.addUser(name, email, status);
    }
    this.closeModal();
  }

  deleteUser(id: number): void {
    this.userService.deleteUser(id);
    if (this.paginatedUsers().length === 1 && this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  toggleStatus(id: number): void {
    this.userService.toggleStatus(id);
  }

  toggleFormStatus(): void {
    this.formIsActive.update(v => !v);
  }

  onFormName(event: Event): void {
    this.formName.set((event.target as HTMLInputElement).value);
  }

  onFormEmail(event: Event): void {
    this.formEmail.set((event.target as HTMLInputElement).value);
  }

  toggleClass(isActive: boolean): string {
    const base = 'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none';
    return isActive ? `${base} bg-green-500` : `${base} bg-gray-300`;
  }

  toggleThumbClass(isActive: boolean): string {
    const base = 'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out';
    return isActive ? `${base} translate-x-4` : `${base} translate-x-0`;
  }
}
