export type UserRole = 'admin' | 'developer' | 'client';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: 'active' | 'inactive';
  avatar: string | null;
  department: string | null;
  phone: string | null;
  created: string;
}
