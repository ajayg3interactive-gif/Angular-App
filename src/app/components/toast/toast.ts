import { Component, inject } from '@angular/core';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast.html',
})
export class ToastComponent {
  toastService = inject(ToastService);

  toastClass(type: Toast['type']): string {
    const base = 'bg-white dark:bg-slate-800 border';
    const map: Record<Toast['type'], string> = {
      success: `${base} border-green-200 dark:border-green-700 text-gray-800 dark:text-gray-100`,
      error:   `${base} border-red-200   dark:border-red-700   text-gray-800 dark:text-gray-100`,
      warning: `${base} border-amber-200 dark:border-amber-700 text-gray-800 dark:text-gray-100`,
      info:    `${base} border-blue-200  dark:border-blue-700  text-gray-800 dark:text-gray-100`,
    };
    return map[type];
  }
}
