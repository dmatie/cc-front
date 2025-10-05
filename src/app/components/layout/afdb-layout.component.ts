import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-afdb-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './afdb-layout.component.html',
  styleUrls: ['./afdb-layout.component.css']
})
export class AfdbLayoutComponent {
  currentLanguage = 'fr';

  constructor(public i18n: I18nService) {
    this.currentLanguage = this.i18n.getCurrentLocale();
  }

  switchLanguage(lang: string, event: Event): void {
    event.preventDefault();
    this.currentLanguage = lang;
    this.i18n.setLocale(lang);
  }
}