import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-confidentiality',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confidentiality.component.html',
  styleUrls: ['./confidentiality.component.css']
})
export class ConfidentialityComponent {
  agreementAccepted = false;

  constructor(
    private router: Router,
    public i18n: I18nService
  ) {}

  proceedToRegistration(): void {
    if (this.agreementAccepted) {
      this.router.navigate(['/register/registration']);
    }
  }

  proceedToCompleteRegistration(): void {
    if (this.agreementAccepted) {
      this.router.navigate(['/register/complete']);
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}