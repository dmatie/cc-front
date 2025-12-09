import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-complete-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './complete-success.component.html',
  styleUrls: ['./complete-success.component.css']
})
export class CompleteSuccessComponent {
  requestId = '';
  customMessage = '';

  constructor(
    private router: Router,
    public i18n: I18nService
  ) {
    this.requestId = sessionStorage.getItem('registrationRequestId') || '';
    this.customMessage = sessionStorage.getItem('registrationMessage') || '';

    sessionStorage.removeItem('registrationRequestId');
    sessionStorage.removeItem('registrationMessage');
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }
}
