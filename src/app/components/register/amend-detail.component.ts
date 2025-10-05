import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { I18nService } from '../../services/i18n.service';
import { AbstractRegistrationService } from '../../services/abstract/registration-service.abstract';
import { RegistrationDetail } from '../../models/registration.model';
import { MapAccessRequestApiStatusToModel, MapAccessRequestModelStatusToApi } from '../../core/utils/helper';

@Component({
  selector: 'app-amend-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './amend-detail.component.html',
  styleUrls: ['./amend-detail.component.css']
})
export class AmendDetailComponent implements OnInit {
  registration: RegistrationDetail | null = null;
  isLoading = true;
  email = '';
  showAbandonModal = false;
  isAbandoning = false;

  constructor(
    private router: Router,
    public i18n: I18nService,
    private registrationService: AbstractRegistrationService
  ) {}

  ngOnInit(): void {
    // Récupérer l'email depuis la session
    this.email = sessionStorage.getItem('amendEmail') || '';
    if (!this.email) {
      this.router.navigate(['/register/amend']);
      return;
    }

    this.loadRegistrationDetail();
  }

  private loadRegistrationDetail(): void {
    this.registrationService.getRegistrationByEmail(this.email).subscribe({
      next: (registration) => {
        this.registration = registration;
        this.isLoading = false;
        
        if (!registration || MapAccessRequestApiStatusToModel(registration.accessRequest.status) !== 'rejected') {
          // Rediriger si pas de demande rejetée
          this.router.navigate(['/register/amend']);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement:', error);
        this.isLoading = false;
        this.router.navigate(['/register/amend']);
      }
    });
  }

  editRequest(): void {
    if (this.registration) {
      // Stocker les données pour le formulaire d'édition
      sessionStorage.setItem('amendRegistrationData', JSON.stringify(this.registration));
      this.router.navigate(['/register/edit']);
    }
  }

  openAbandonModal(): void {
    this.showAbandonModal = true;
  }

  closeAbandonModal(): void {
    this.showAbandonModal = false;
  }

  confirmAbandon(): void {
    if (this.registration) {
      this.isAbandoning = true;
      
      this.registrationService.abandonRegistration(this.registration.accessRequest.id).subscribe({
        next: (response) => {
          this.isAbandoning = false;
          this.showAbandonModal = false;
          
          // Nettoyer la session
          sessionStorage.removeItem('amendEmail');
          sessionStorage.removeItem('amendRegistrationData');
          
          // Stocker le message de succès
          sessionStorage.setItem('abandonMessage', response.message);
          
          // Rediriger vers une page de confirmation
          this.router.navigate(['/register/abandoned']);
        },
        error: (error) => {
          console.error('Erreur lors de l\'abandon:', error);
          this.isAbandoning = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/register/otp']);
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

}