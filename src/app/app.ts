import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Spinner } from './components/spinner/spinner';
import { ToastComponent } from './components/toast/toast';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Spinner, ToastComponent],
  template: `
    <router-outlet></router-outlet>
    <app-spinner></app-spinner>
    <app-toast></app-toast>
  `,
})
export class App implements OnInit {
  private themeService = inject(ThemeService);
  private platformId   = inject(PLATFORM_ID);

  ngOnInit(): void {
    // ThemeService constructor already restores theme;
    // this ensures it's applied after the view is ready on the browser.
    if (isPlatformBrowser(this.platformId)) {
      const settings = this.themeService.settings();
      // Re-trigger applyTheme by calling updateSettings with current values.
      // This is a no-op if already applied but guarantees DOM is ready.
      this.themeService.updateSettings({});
    }
  }
}
