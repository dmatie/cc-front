import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-amend-abandoned',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './amend-abandoned.component.html',
  styleUrls: ['./amend-abandoned.component.css']
})
export class AmendAbandonedComponent implements OnInit {
  abandonMessage = '';

  constructor(
    private router: Router,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    // Récupérer le message depuis la session
    this.abandonMessage = sessionStorage.getItem('abandonMessage') || '';
    
    // Nettoyer la session
    sessionStorage.removeItem('abandonMessage');
    sessionStorage.removeItem('amendEmail');
    sessionStorage.removeItem('amendRegistrationData');
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  createNewRequest(): void {
    this.router.navigate(['/register/confidentiality']);
  }
}