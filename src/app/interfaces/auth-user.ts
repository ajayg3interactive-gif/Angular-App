export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  token: string;
  loginAt: string;
}

export type ThemeName = 'light' | 'dark' | 'blue' | 'purple' | 'modern';
export type Language  = 'en' | 'es' | 'fr' | 'de' | 'hi';

export interface AppSettings {
  theme: ThemeName;
  darkMode: boolean;
  notifications: boolean;
  language: Language;
}
