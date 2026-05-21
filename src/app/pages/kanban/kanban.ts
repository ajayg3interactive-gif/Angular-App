import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Sidebar } from '../../components/sidebar/sidebar';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { RbacService } from '../../services/rbac.service';
import { Card, CardStatus, CARD_COLUMNS, Priority, PRIORITY_CONFIG } from '../../interfaces/project';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, Sidebar],
  templateUrl: './kanban.html',
})
export class KanbanPage implements OnInit {
  auth       = inject(AuthService);
  projectSvc = inject(ProjectService);
  userSvc    = inject(UserService);
  toast      = inject(ToastService);
  rbac       = inject(RbacService);

  loading       = signal(true);
  showCardModal = signal(false);
  saving        = signal(false);
  selectedCard  = signal<Card | null>(null);
  filterProject = signal<number | ''>('');
  filterAssignee= signal<number | ''>('');

  priorityConfig = PRIORITY_CONFIG;
  columns = CARD_COLUMNS;

  showAssigneeDropdown = signal(false);

  cardForm = signal({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    projectId: 0,
    assignedTo: [] as number[],
    dueDate: '',
    labels: '',
    estimatedHours: 0,
  });

  /** Boards: map from status → cards */
  readonly boardCards = computed(() => {
    const uid  = this.auth.currentUser()?.id;
    const role = this.auth.currentUser()?.role;
    const pid  = this.filterProject();
    const aid  = this.filterAssignee();

    return this.projectSvc.cards().filter(c => {
      if (role === 'developer' && !this.rbac.isAdmin()) {
        if (!c.assignedTo.includes(uid!)) return false;
      }
      if (pid && c.projectId !== Number(pid)) return false;
      if (aid && !c.assignedTo.includes(Number(aid))) return false;
      return true;
    });
  });

  getColumn(status: CardStatus): Card[] {
    return this.boardCards().filter(c => c.status === status);
  }

  readonly connectedLists = computed(() => this.columns.map(c => `col-${c.key}`));

  ngOnInit(): void {
    this.projectSvc.loadAll().subscribe(() => this.loading.set(false));
    this.userSvc.loadAll().subscribe();
  }

  onDrop(event: CdkDragDrop<Card[]>, targetStatus: CardStatus): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const card: Card = event.previousContainer.data[event.previousIndex];
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      this.projectSvc.moveCard(card.id, targetStatus).subscribe({
        next: () => this.toast.success(`Moved to ${this.columns.find(c => c.key === targetStatus)?.label}`),
        error: () => this.toast.error('Failed to move card'),
      });
    }
  }

  openCard(card: Card): void {
    this.selectedCard.set(card);
    this.showCardModal.set(true);
    this.showAssigneeDropdown.set(false);
    this.cardForm.set({
      title: card.title,
      description: card.description,
      priority: card.priority,
      projectId: card.projectId,
      assignedTo: [...card.assignedTo],
      dueDate: card.dueDate,
      labels: card.labels.join(', '),
      estimatedHours: card.estimatedHours,
    });
  }

  openCreateCard(status: CardStatus = 'backlog'): void {
    if (!this.rbac.isAdmin()) { this.toast.error('Only admins can create cards'); return; }
    this.selectedCard.set(null);
    this.cardForm.set({ title: '', description: '', priority: 'medium', projectId: this.projectSvc.projects()[0]?.id ?? 0, assignedTo: [], dueDate: '', labels: '', estimatedHours: 0 });
    this.showAssigneeDropdown.set(false);
    this.showCardModal.set(true);
  }

  saveCard(): void {
    const f = this.cardForm();
    if (!f.title.trim()) { this.toast.error('Title is required'); return; }
    this.saving.set(true);

    const target = this.selectedCard();
    const data: Partial<Card> = {
      title: f.title.trim(),
      description: f.description.trim(),
      priority: f.priority,
      projectId: Number(f.projectId),
      assignedTo: f.assignedTo,
      dueDate: f.dueDate,
      labels: f.labels.split(',').map(l => l.trim()).filter(Boolean),
      estimatedHours: Number(f.estimatedHours),
    };

    const obs$ = target
      ? this.projectSvc.updateCard(target.id, data)
      : this.projectSvc.createCard({ ...data, status: 'backlog', completion: 0, loggedHours: 0, clientId: 4, created: new Date().toISOString().split('T')[0] } as Omit<Card, 'id'>);

    obs$.subscribe({
      next: () => { this.toast.success('Card saved'); this.showCardModal.set(false); this.saving.set(false); },
      error: () => { this.toast.error('Failed to save'); this.saving.set(false); },
    });
  }

  deleteCard(id: number): void {
    if (!this.rbac.isAdmin()) { this.toast.error('Only admins can delete cards'); return; }
    if (!confirm('Delete this card?')) return;
    this.projectSvc.deleteCard(id).subscribe({
      next: () => { this.toast.success('Card deleted'); this.showCardModal.set(false); },
      error: () => this.toast.error('Failed to delete'),
    });
  }

  toggleAssignee(id: number): void {
    const current = this.cardForm().assignedTo;
    const updated = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
    this.cardForm.update(f => ({ ...f, assignedTo: updated }));
  }

  getUserName(id: number): string {
    return this.userSvc.users().find(u => u.id === id)?.name ?? 'Unknown';
  }

  developers() { return this.userSvc.users().filter(u => u.role === 'developer'); }

  isOverdue(dueDate: string): boolean {
    return !!dueDate && dueDate < new Date().toISOString().split('T')[0];
  }
}
