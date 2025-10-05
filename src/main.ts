import { bootstrapApplication } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { appConfig } from './app/app.config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div>
      <router-outlet></router-outlet>
    </div>
  `
})
export class App {
  constructor() {
    console.log('🚀 App component loaded');
  }
}

bootstrapApplication(App, appConfig)
  .then(() => console.log('✅ Application bootstrapped successfully'))
  .catch(err => {
    console.error('❌ Bootstrap error:', err);
    // Afficher l'erreur sur la page
    document.body.innerHTML = `
      <div style="padding: 20px; color: red;">
        <h1>Erreur de chargement</h1>
        <pre>${err.message}</pre>
        <pre>${err.stack}</pre>
      </div>
    `;
  });