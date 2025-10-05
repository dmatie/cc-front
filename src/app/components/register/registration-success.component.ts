import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-registration-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './registration-success.component.html',
  styleUrls: ['./registration-success.component.css']
})
export class RegistrationSuccessComponent {
  requestId = '';
  customMessage = '';

  constructor(
    private router: Router,
    public i18n: I18nService
  ) {
    // Récupérer les données de la session
    this.requestId = sessionStorage.getItem('registrationRequestId') || '';
    this.customMessage = sessionStorage.getItem('registrationMessage') || '';
    
    // Nettoyer la session
    sessionStorage.removeItem('registrationRequestId');
    sessionStorage.removeItem('registrationMessage');
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }
}