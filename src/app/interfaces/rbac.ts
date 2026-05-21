import { UserRole } from './user';

export type Permission =
  | '*'
  | 'projects:read'
  | 'projects:create'
  | 'projects:update'
  | 'projects:delete'
  | 'projects:own:read'
  | 'tasks:read'
  | 'tasks:update'
  | 'tasks:complete'
  | 'tasks:create'
  | 'tasks:delete'
  | 'cards:read'
  | 'cards:create'
  | 'cards:update'
  | 'cards:move'
  | 'cards:delete'
  | 'users:read'
  | 'users:create'
  | 'users:update'
  | 'users:delete'
  | 'teams:read'
  | 'teams:create'
  | 'teams:manage'
  | 'comments:read'
  | 'comments:create'
  | 'analytics:read'
  | 'settings:manage'
  | 'files:upload'
  | 'notifications:read'
  | 'feedback:create'
  | 'milestones:read';

export interface RoleDefinition {
  role: UserRole;
  label: string;
  permissions: Permission[];
  defaultRoute: string;
  color: string;
  icon: string;
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  admin: {
    role: 'admin',
    label: 'Administrator',
    defaultRoute: '/admin-dashboard',
    color: '#6366f1',
    icon: 'shield',
    permissions: ['*'],
  },
  developer: {
    role: 'developer',
    label: 'Developer',
    defaultRoute: '/developer-dashboard',
    color: '#0891b2',
    icon: 'code',
    permissions: [
      'projects:read',
      'tasks:read',
      'tasks:update',
      'tasks:complete',
      'cards:read',
      'cards:update',
      'cards:move',
      'comments:read',
      'comments:create',
      'files:upload',
      'notifications:read',
      'milestones:read',
    ],
  },
  client: {
    role: 'client',
    label: 'Client',
    defaultRoute: '/client-dashboard',
    color: '#059669',
    icon: 'briefcase',
    permissions: [
      'projects:own:read',
      'milestones:read',
      'comments:read',
      'comments:create',
      'feedback:create',
      'notifications:read',
    ],
  },
};
