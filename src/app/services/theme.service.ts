import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AppSettings, ThemeName } from '../interfaces/auth-user';

const DEFAULT_SETTINGS: AppSettings = {
  theme:         'light',
  darkMode:      false,
  notifications: true,
  language:      'en',
};

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser  = isPlatformBrowser(this.platformId);
  private readonly STORAGE_KEY = 'app_settings';

  private _settings = signal<AppSettings>({ ...DEFAULT_SETTINGS });

  readonly settings      = this._settings.asReadonly();
  readonly theme         = computed(() => this._settings().theme);
  readonly isDark        = computed(() => this._settings().darkMode || this._settings().theme === 'dark' || this._settings().theme === 'modern');
  readonly notifications = computed(() => this._settings().notifications);
  readonly language      = computed(() => this._settings().language);

  constructor() {
    if (this.isBrowser) {
      this.loadSettings();
      this.applyTheme(this._settings());
    }
  }

  updateSettings(partial: Partial<AppSettings>): void {
    this._settings.update(s => ({ ...s, ...partial }));
    if (this.isBrowser) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._settings()));
      this.applyTheme(this._settings());
    }
  }

  setTheme(theme: ThemeName): void {
    const darkMode = theme === 'dark' || theme === 'modern' ? true : this._settings().darkMode;
    this.updateSettings({ theme, darkMode });
  }

  toggleDarkMode(): void {
    const current = this._settings();
    const darkMode = !current.darkMode;
    const theme: ThemeName = darkMode && current.theme === 'light' ? 'light' : current.theme;
    this.updateSettings({ darkMode, theme });
  }

  /** CSS class string for the sidebar background based on current theme. */
  sidebarStyle(): string {
    const theme = this._settings().theme;
    const dark  = this.isDark();
    if (dark && theme === 'light')   return 'background-color:#0f172a';
    if (theme === 'dark')            return 'background-color:#020617';
    if (theme === 'blue')            return 'background-color:#1e3a5f';
    if (theme === 'purple')          return 'background-color:#3b0764';
    if (theme === 'modern')          return 'background-color:#020617';
    return 'background-color:#0f172a'; // light default
  }

  private loadSettings(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return;
    try {
      this._settings.set({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
    } catch {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  private applyTheme(settings: AppSettings): void {
    const html = document.documentElement;

    // Set data-theme attribute for CSS variable switching
    const isDark = settings.darkMode || settings.theme === 'dark' || settings.theme === 'modern';
    html.setAttribute('data-theme', settings.theme);

    // Toggle Tailwind dark class (enables dark: variants)
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }
}
