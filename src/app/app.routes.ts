import { Routes } from '@angular/router';
import { ExternalUserGuard } from './guards/external-user.guard';
import { InternalUserGuard } from './guards/internal-user.guard';
import { inject } from '@angular/core';

export const routes: Routes = [
  // Page d'accueil
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },

  // Processus d'enregistrement
  {
    path: 'register/confidentiality',
    loadComponent: () => import('./components/register/confidentiality.component').then(m => m.ConfidentialityComponent)
  },
  {
    path: 'register/registration',
    loadComponent: () => import('./components/register/registration-form.component').then(m => m.RegistrationFormComponent)
  },
    {
    path: 'register/review',
    loadComponent: () => import('./components/register/registration-review.component').then(m => m.RegistrationReviewComponent)
  },
  {
    path: 'register/success',
    loadComponent: () => import('./components/register/registration-success.component').then(m => m.RegistrationSuccessComponent)
  },

   // Routes pour le processus d'amendement
  { 
    path: 'register/amend', 
    loadComponent: () => import('./components/register/amend-email.component').then(m => m.AmendEmailComponent)
  },
  { 
    path: 'register/otp', 
    loadComponent: () => import('./components/register/amend-otp.component').then(m => m.AmendOtpComponent)
  },
  { 
    path: 'register/detail', 
    loadComponent: () => import('./components/register/amend-detail.component').then(m => m.AmendDetailComponent)
  },
  { 
    path: 'register/edit', 
    loadComponent: () => import('./components/register/amend-edit.component').then(m => m.AmendEditComponent)
  },
  { 
    path: 'register/abandoned', 
    loadComponent: () => import('./components/register/amend-abandoned.component').then(m => m.AmendAbandonedComponent)
  },
  
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  // Client externe
  {
    path: 'client/home',
    loadComponent: () => import('./components/external-client/external-client-home.component').then(m => m.ExternalClientHomeComponent),
    canActivate: [() => inject(ExternalUserGuard).canActivate()]
  },
  {
    path: 'internal/dashboard',
    loadComponent: () => import('./components/internal-dashboard/internal-dashboard.component').then(m => m.InternalDashboardComponent),
    canActivate: [() => inject(InternalUserGuard).canActivate()]
  },

  // Administration des demandes d'accès
  {
    path: 'admin/accessrequests',
    loadComponent: () => import('./components/admin/access-request-list.component').then(m => m.AccessRequestListComponent),
    canActivate: [() => inject(InternalUserGuard).canActivate()]
  },
  {
    path: 'admin/accessrequests/:id',
    loadComponent: () => import('./components/admin/access-request-detail.component').then(m => m.AccessRequestDetailComponent),
    canActivate: [() => inject(InternalUserGuard).canActivate()]
  },

  {
    path: 'no-access',
    loadComponent: () => import('./components/no-access/no-access.component').then(m => m.NoAccessComponent)
  },

  // Claims - External users
  {
    path: 'claims',
    loadComponent: () => import('./components/claims/external-claims-list.component').then(m => m.ExternalClaimsListComponent),
    canActivate: [() => inject(ExternalUserGuard).canActivate()]
  },
  {
    path: 'claims/:id',
    loadComponent: () => import('./components/claims/claim-detail.component').then(m => m.ClaimDetailComponent),
    canActivate: [() => inject(ExternalUserGuard).canActivate()]
  },

  // Claims - Internal users
  {
    path: 'admin/claims',
    loadComponent: () => import('./components/claims/internal-claims-list.component').then(m => m.InternalClaimsListComponent),
    canActivate: [() => inject(InternalUserGuard).canActivate()]
  },
  {
    path: 'admin/claims/:id',
    loadComponent: () => import('./components/claims/claim-detail.component').then(m => m.ClaimDetailComponent),
    canActivate: [() => inject(InternalUserGuard).canActivate()]
  },

  // Route par défaut (404)
  {
    path: '**',
    redirectTo: '/home'
  }
];