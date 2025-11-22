import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private currentLocaleSubject = new BehaviorSubject<string>('fr');
  public currentLocale$ = this.currentLocaleSubject.asObservable();
  
  private translations: { [locale: string]: any } = {};
  private loadedLocales: Set<string> = new Set();

  constructor(private http: HttpClient) {
    // Charger la locale par défaut
    const savedLocale = localStorage.getItem('locale') || 'fr';
    this.currentLocaleSubject.next(savedLocale);
    this.loadTranslations(savedLocale);
  }

  /**
   * Charge les traductions pour une locale donnée
   */
  private loadTranslations(locale: string): Promise<void> {
    if (this.loadedLocales.has(locale)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.http.get(`/assets/i18n/${locale}.json`).subscribe({
        next: (translations) => {
          this.translations[locale] = translations;
          this.loadedLocales.add(locale);
          console.log(`✅ Translations loaded for locale: ${locale}`);
          resolve();
        },
        error: (error) => {
          console.error(`❌ Failed to load translations for locale: ${locale}`, error);
          reject(error);
        }
      });
    });
  }

  /**
   * Change la locale actuelle
   */
  async setLocale(locale: string): Promise<void> {
    try {
      await this.loadTranslations(locale);
      this.currentLocaleSubject.next(locale);
      localStorage.setItem('locale', locale);
      console.log(`🌐 Locale changed to: ${locale}`);
    } catch (error) {
      console.error(`❌ Failed to set locale to: ${locale}`, error);
    }
  }

  /**
   * Obtient la locale actuelle
   */
  getCurrentLocale(): string {
    return this.currentLocaleSubject.value;
  }

  /**
   * Traduit une clé
   */
  translate(key: string, params?: { [key: string]: any }): string {
    const locale = this.getCurrentLocale();
    const translation = this.getNestedTranslation(this.translations[locale], key);
    
    if (!translation) {
      console.warn(`⚠️ Translation not found for key: ${key} in locale: ${locale}`);
      return key; // Retourner la clé si pas de traduction
    }

    // Remplacer les paramètres si fournis
    if (params) {
      return this.interpolateParams(translation, params);
    }

    return translation;
  }

  /**
   * Alias pour translate (plus court)
   */
  t(key: string, params?: { [key: string]: any }): string {
    return this.translate(key, params);
  }

  /**
   * Obtient une traduction imbriquée
   */
  private getNestedTranslation(obj: any, key: string): string | null {
    const keys = key.split('.');
    let current = obj;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return null;
      }
    }

    return typeof current === 'string' ? current : null;
  }

  /**
   * Interpole les paramètres dans une chaîne
   */
  private interpolateParams(text: string, params: { [key: string]: any }): string {
    let result = text;
    
    Object.keys(params).forEach(key => {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), params[key]);
    });

    return result;
  }

  /**
   * Vérifie si une traduction existe
   */
  hasTranslation(key: string): boolean {
    const locale = this.getCurrentLocale();
    return this.getNestedTranslation(this.translations[locale], key) !== null;
  }

  /**
   * Obtient toutes les traductions pour une locale
   */
  getTranslations(locale?: string): any {
    const targetLocale = locale || this.getCurrentLocale();
    return this.translations[targetLocale] || {};
  }

  /**
   * Obtient la liste des locales disponibles
   */
  getAvailableLocales(): string[] {
    return Array.from(this.loadedLocales);
  }
}