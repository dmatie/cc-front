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
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-container';
    
    const title = document.createElement('h1');
    title.textContent = 'Erreur de chargement';
    
    const messageElement = document.createElement('pre');
    messageElement.textContent = err.message || 'Unknown error';
    
    const stackElement = document.createElement('pre');
    stackElement.textContent = err.stack || '';
    
    errorDiv.appendChild(title);
    errorDiv.appendChild(messageElement);
    if (err.stack) {
      errorDiv.appendChild(stackElement);
    }
    
    document.body.appendChild(errorDiv);

  });