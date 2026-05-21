import { Component, inject } from '@angular/core';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-spinner',
  standalone: true,
  templateUrl: './spinner.html',
})
export class Spinner {
  loading = inject(LoadingService);
}
