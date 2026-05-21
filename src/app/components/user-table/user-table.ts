import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-user-table',
  standalone: true,
  templateUrl: './user-table.html',
})
export class UserTable implements OnInit {
  private userService = inject(UserService);

  readonly pageSize = 8;
  searchQuery = signal('');
  currentPage = signal(1);
  isLoading   = signal(true);
  editId      = signal<number | null>(null);
  editName    = signal('');
  editEmail   = signal('');

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

  isEditing = computed(() => this.editId() !== null);

  skeletonRows = Array(5).fill(null);

  ngOnInit(): void {
    this.userService.loadAll().subscribe(() => this.isLoading.set(false));
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  toggleStatus(id: number): void {
    this.userService.toggleStatus(id);
  }

  deleteUser(id: number): void {
    this.userService.deleteUser(id);
    if (this.paginatedUsers().length === 1 && this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  startEdit(user: User): void {
    this.editId.set(user.id);
    this.editName.set(user.name);
    this.editEmail.set(user.email);
  }

  onEditName(event: Event): void {
    this.editName.set((event.target as HTMLInputElement).value);
  }

  onEditEmail(event: Event): void {
    this.editEmail.set((event.target as HTMLInputElement).value);
  }

  saveEdit(): void {
    const id = this.editId();
    if (id !== null) {
      this.userService.editUser(id, { name: this.editName(), email: this.editEmail() });
      this.editId.set(null);
    }
  }

  cancelEdit(): void {
    this.editId.set(null);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
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
