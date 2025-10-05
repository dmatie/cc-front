import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-switcher.component.html'
})
export class LanguageSwitcherComponent {
  currentLocale: string;

  constructor(public i18n: I18nService) {
    this.currentLocale = this.i18n.getCurrentLocale();
    
    // S'abonner aux changements de locale
    this.i18n.currentLocale$.subscribe(locale => {
      this.currentLocale = locale;
    });
  }

  switchLanguage(locale: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.i18n.setLocale(locale);
    
    // Fermer le dropdown manuellement
    const dropdownElement = document.getElementById('languageDropdown');
    if (dropdownElement) {
      const dropdown = (window as any).bootstrap?.Dropdown?.getInstance(dropdownElement);
      if (dropdown) {
        dropdown.hide();
      }
    }
  }

  getCurrentLanguageLabel(): string {
    return this.currentLocale === 'fr' ? 'Français' : 'English';
  }
}