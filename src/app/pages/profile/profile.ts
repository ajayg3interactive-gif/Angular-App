import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { Sidebar } from '../../components/sidebar/sidebar';
import { ThemeName, Language } from '../../interfaces/auth-user';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, Sidebar, DatePipe, TitleCasePipe],
  templateUrl: './profile.html',
})
export class ProfilePage implements OnInit {
  auth        = inject(AuthService);
  themeService = inject(ThemeService);
  userService  = inject(UserService);
  toast        = inject(ToastService);

  // Profile edit form signals
  editName    = signal('');
  editEmail   = signal('');
  isSaving    = signal(false);
  activeTab   = signal<'profile' | 'settings'>('profile');

  readonly themes: { name: ThemeName; label: string; icon: string; accent: string; bg: string }[] = [
    { name: 'light',   label: 'Light',   icon: '☀️',  accent: '#6366f1', bg: '#f9fafb' },
    { name: 'dark',    label: 'Dark',    icon: '🌙',  accent: '#818cf8', bg: '#0f172a' },
    { name: 'blue',    label: 'Blue',    icon: '🌊',  accent: '#2563eb', bg: '#1e3a5f' },
    { name: 'purple',  label: 'Purple',  icon: '🔮',  accent: '#7c3aed', bg: '#3b0764' },
    { name: 'modern',  label: 'Modern',  icon: '⚡',  accent: '#06b6d4', bg: '#020617' },
  ];

  readonly languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English',  flag: '🇺🇸' },
    { code: 'es', label: 'Español',  flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch',  flag: '🇩🇪' },
    { code: 'hi', label: 'हिंदी',    flag: '🇮🇳' },
  ];

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user) {
      this.editName.set(user.name);
      this.editEmail.set(user.email);
    }
  }

  get userInitial(): string {
    return (this.auth.currentUser()?.name ?? 'U').charAt(0).toUpperCase();
  }

  saveProfile(): void {
    const name  = this.editName().trim();
    const email = this.editEmail().trim();
    const user  = this.auth.currentUser();
    if (!name || !email || !user) return;

    this.isSaving.set(true);
    this.userService.editUser(user.id, { name, email });
    this.auth.updateStoredUser({ name, email });

    setTimeout(() => {
      this.isSaving.set(false);
      this.toast.success('Profile updated successfully!');
    }, 600);
  }

  setTheme(theme: ThemeName): void {
    this.themeService.setTheme(theme);
    this.toast.success(`Theme changed to ${theme}`);
  }

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }

  setLanguage(lang: Language): void {
    this.themeService.updateSettings({ language: lang });
    this.toast.info(`Language set to ${this.languages.find(l => l.code === lang)?.label}`);
  }

  toggleNotifications(): void {
    const current = this.themeService.notifications();
    this.themeService.updateSettings({ notifications: !current });
    this.toast.info(current ? 'Notifications disabled' : 'Notifications enabled');
  }

  isActiveTheme(theme: ThemeName): boolean {
    return this.themeService.theme() === theme;
  }
}
