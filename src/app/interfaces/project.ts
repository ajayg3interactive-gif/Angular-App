export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
export type CardStatus = 'backlog' | 'todo' | 'in_progress' | 'testing' | 'review' | 'completed' | 'delivered';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed';

export interface Project {
  id: number;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  clientId: number;
  teamId: number;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  completion: number;
  tags: string[];
  created: string;
}

export interface Team {
  id: number;
  name: string;
  description: string;
  memberIds: number[];
  leadId: number;
  projectIds: number[];
  created: string;
}

export interface Card {
  id: number;
  title: string;
  description: string;
  status: CardStatus;
  priority: Priority;
  projectId: number;
  assignedTo: number[];
  clientId: number;
  dueDate: string;
  created: string;
  completion: number;
  labels: string[];
  estimatedHours: number;
  loggedHours: number;
}

export interface Comment {
  id: number;
  cardId: number;
  userId: number;
  text: string;
  created: string;
}

export interface AppNotification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  created: string;
  link: string;
}

export interface Milestone {
  id: number;
  projectId: number;
  title: string;
  description: string;
  dueDate: string;
  status: MilestoneStatus;
  completion: number;
}

export interface ActivityLog {
  id: number;
  userId: number;
  action: string;
  entity: string;
  entityId: number;
  detail: string;
  created: string;
}

export const CARD_COLUMNS: { key: CardStatus; label: string; color: string }[] = [
  { key: 'backlog',     label: 'Backlog',     color: '#64748b' },
  { key: 'todo',        label: 'Todo',        color: '#3b82f6' },
  { key: 'in_progress', label: 'In Progress', color: '#f59e0b' },
  { key: 'testing',     label: 'Testing',     color: '#8b5cf6' },
  { key: 'review',      label: 'Review',      color: '#06b6d4' },
  { key: 'completed',   label: 'Completed',   color: '#10b981' },
  { key: 'delivered',   label: 'Delivered',   color: '#6366f1' },
];

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  low:      { label: 'Low',      color: '#64748b', bg: '#f1f5f9' },
  medium:   { label: 'Medium',   color: '#f59e0b', bg: '#fef3c7' },
  high:     { label: 'High',     color: '#ef4444', bg: '#fee2e2' },
  critical: { label: 'Critical', color: '#dc2626', bg: '#fecaca' },
};
