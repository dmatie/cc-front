# Guide d'utilisation du ErrorHandlerService

## 📚 Vue d'ensemble

Le `ErrorHandlerService` est le service centralisé pour gérer toutes les erreurs API de l'application. Il offre :

- ✅ **Traduction automatique** des codes d'erreur (FR/EN)
- ✅ **Logging centralisé** pour debugging
- ✅ **Gestion des codes HTTP** standards (401, 403, 404, 500, etc.)
- ✅ **Support des erreurs de validation**
- ✅ **Pas d'affichage automatique** (toast) - chaque composant décide comment afficher

---

## 🎯 Architecture

### Architecture recommandée (avec handleApiErrorRx)

```
┌──────────────────────────────────────────────────────────┐
│              Appel API qui échoue                        │
└─────────────────────┬────────────────────────────────────┘
                      │
                      ▼
      ┌───────────────────────────────┐
      │   Service API                 │
      │   .pipe(                      │
      │     catchError(               │
      │       handleApiErrorRx()      │← Gestion centralisée !
      │     )                         │
      │   )                           │
      └────────────┬──────────────────┘
                   │
                   ▼
      ┌───────────────────────────────┐
      │   ErrorHandlerService         │
      │   • Logging                   │
      │   • Traduction (i18n)         │
      │   • Formatage                 │
      └────────────┬──────────────────┘
                   │
                   ▼
      ┌───────────────────────────────┐
      │   Composant (simple)          │
      │   error.message               │← Erreur déjà traitée !
      └───────────────────────────────┘
```

### Architecture alternative (legacy)

Si tu préfères gérer les erreurs dans le composant :

```
┌──────────────────────────────────────────────────────────┐
│              Appel API qui échoue                        │
└─────────────────────┬────────────────────────────────────┘
                      │
                      ▼
      ┌───────────────────────────────┐
      │   ApiErrorInterceptor         │
      │   Transforme en ApiError      │
      └────────────┬──────────────────┘
                   │
                   ▼
      ┌───────────────────────────────┐
      │   Composant                   │
      │   handleApiError(error)       │← Gestion manuelle
      └────────────┬──────────────────┘
                   │
                   ▼
      ┌───────────────────────────────┐
      │   ErrorHandlerService         │
      │   • Logging                   │
      │   • Traduction (i18n)         │
      │   • Formatage                 │
      └────────────┬──────────────────┘
                   │
                   ▼
      ┌───────────────────────────────┐
      │   Composant affiche           │
      │   this.errorMessage = ...     │
      └───────────────────────────────┘
```

---

## 💻 Utilisation

### ✅ MÉTHODE RECOMMANDÉE : Gestion dans les services API

**Avantages :**
- Code DRY (Don't Repeat Yourself)
- Pas besoin d'injecter `ErrorHandlerService` dans les composants
- Erreurs déjà traduites et formatées
- Logging automatique avec contexte du service

#### 1. Dans le service API

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorHandlerService } from '../error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class ApiRegistrationService {
  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService  // ← Injection du service
  ) {}

  submitRegistration(data: any): Observable<any> {
    return this.http.post('/api/registrations', data).pipe(
      catchError(this.errorHandler.handleApiErrorRx('RegistrationService'))  // ← Gestion centralisée !
    );
  }

  getRegistration(id: string): Observable<any> {
    return this.http.get(`/api/registrations/${id}`).pipe(
      catchError(this.errorHandler.handleApiErrorRx('RegistrationService'))  // ← Même pattern partout
    );
  }
}
```

#### 2. Dans le composant (SIMPLIFIÉ)

```typescript
import { Component } from '@angular/core';
import { AbstractRegistrationService } from '../../services/abstract/registration-service.abstract';

@Component({
  selector: 'app-registration-form',
  templateUrl: './registration-form.component.html'
})
export class RegistrationFormComponent {
  errorMessage = '';
  isSubmitting = false;

  constructor(
    private registrationService: AbstractRegistrationService
    // ✅ Plus besoin d'injecter ErrorHandlerService !
  ) {}

  onSubmit() {
    this.isSubmitting = true;
    this.errorMessage = '';

    this.registrationService.submitRegistration(this.formData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.router.navigate(['/success']);
      },
      error: (error) => {
        // ✅ L'erreur est déjà traitée et traduite !
        this.errorMessage = error.message;
        this.isSubmitting = false;
      }
    });
  }
}
```

**Dans le template HTML :**
```html
<div *ngIf="errorMessage" class="alert alert-danger" role="alert">
  {{ errorMessage }}
</div>

<button (click)="onSubmit()" [disabled]="isSubmitting">
  {{ isSubmitting ? 'Envoi...' : 'Soumettre' }}
</button>
```

---

### ⚠️ MÉTHODE ALTERNATIVE : Gestion dans le composant (Legacy)

Utilise cette méthode uniquement si tu as besoin de logique spécifique dans le composant.

```typescript
import { Component } from '@angular/core';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { AbstractRegistrationService } from '../../services/abstract/registration-service.abstract';

@Component({
  selector: 'app-registration-form',
  templateUrl: './registration-form.component.html'
})
export class RegistrationFormComponent {
  errorMessage = '';
  isSubmitting = false;

  constructor(
    private registrationService: AbstractRegistrationService,
    private errorHandler: ErrorHandlerService  // ← Injection nécessaire
  ) {}

  onSubmit() {
    this.isSubmitting = true;
    this.errorMessage = '';

    this.registrationService.submitRegistration(this.formData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.router.navigate(['/success']);
      },
      error: (error) => {
        // ⚠️ Gestion manuelle de l'erreur
        this.errorMessage = this.errorHandler.handleApiError(error, 'RegistrationForm');
        this.isSubmitting = false;
      }
    });
  }
}
```

---

### Exemple 2 : Gestion des erreurs de validation

```typescript
onSubmit() {
  this.registrationService.submitRegistration(this.formData).subscribe({
    error: (error) => {
      // Option 1 : Afficher la première erreur
      this.errorMessage = this.errorHandler.handleApiError(error);

      // Option 2 : Récupérer toutes les erreurs de validation
      const validationErrors = this.errorHandler.getAllValidationErrors(error);
      if (validationErrors.length > 0) {
        this.errorMessages = validationErrors;  // Array de messages
      }
    }
  });
}
```

**Dans le template HTML :**
```html
<!-- Affichage de plusieurs erreurs -->
<div *ngIf="errorMessages.length > 0" class="alert alert-danger">
  <ul class="mb-0">
    <li *ngFor="let error of errorMessages">{{ error }}</li>
  </ul>
</div>
```

---

### Exemple 3 : Redirection automatique pour 401/403

```typescript
onSubmit() {
  this.registrationService.submitRegistration(this.formData).subscribe({
    error: (error) => {
      this.errorMessage = this.errorHandler.handleApiError(error);

      // ✅ Redirection automatique vers login si non autorisé
      if (this.errorHandler.shouldRedirectToLogin(error)) {
        this.router.navigate(['/login']);
      }
    }
  });
}
```

---

### Exemple 4 : Utilisation avec RxJS pipe

```typescript
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

loadData() {
  this.dataService.getData()
    .pipe(
      catchError(error => {
        // ✅ Utilisation de handleApiErrorRx pour les pipes
        this.errorMessage = this.errorHandler.handleApiError(error, 'DataLoading');
        return of([]); // Retourne un tableau vide en cas d'erreur
      })
    )
    .subscribe(data => {
      this.data = data;
    });
}
```

---

## 🔍 Méthodes disponibles

### `handleApiError(error: ApiError, context?: string): string`

Méthode principale pour traiter les erreurs.

**Paramètres :**
- `error`: L'erreur interceptée par `ApiErrorInterceptor`
- `context`: (optionnel) Nom du composant pour le logging (ex: 'LoginComponent')

**Retourne :** Message d'erreur traduit et formaté

**Exemple :**
```typescript
this.errorMessage = this.errorHandler.handleApiError(error, 'LoginComponent');
```

---

### `handleApiErrorRx(context?: string): (error: ApiError) => Observable<ApiError>`

Variante RxJS pour utiliser dans les pipes `catchError`.

**Exemple :**
```typescript
this.service.getData()
  .pipe(
    catchError(this.errorHandler.handleApiErrorRx('DataComponent'))
  )
  .subscribe(...);
```

---

### `shouldRedirectToLogin(error: ApiError): boolean`

Vérifie si l'erreur nécessite une redirection vers la page de login.

**Retourne :** `true` pour les codes 401 et 403

**Exemple :**
```typescript
if (this.errorHandler.shouldRedirectToLogin(error)) {
  this.router.navigate(['/login']);
}
```

---

### `getAllValidationErrors(error: ApiError): string[]`

Récupère toutes les erreurs de validation traduites.

**Retourne :** Tableau de messages d'erreur

**Exemple :**
```typescript
const errors = this.errorHandler.getAllValidationErrors(error);
// ['Le prénom doit contenir au moins 2 caractères', 'Le pays est requis']
```

---

## 📝 Types d'erreurs gérées

### 1. Erreurs de validation (format backend)

```json
{
  "message": "Erreurs de validation",
  "status": 400,
  "validationErrors": [
    { "field": "firstName", "error": "ERR.General.FirstNameTooShort" },
    { "field": "country", "error": "ERR.General.CountryRequired" }
  ]
}
```

**Traitement :** Traduit chaque code d'erreur via `ErrorTranslationService`

---

### 2. Codes d'erreur métier (format `ERR.xxx.yyy`)

```json
{
  "message": "ERR.General.EmailAlreadyExists",
  "status": 400
}
```

**Traitement :** Traduit via `ErrorTranslationService`

**Codes supportés :**
- `ERR.General.*` - Erreurs générales
- `ERR.Auth.*` - Erreurs d'authentification
- `ERR.Permission.*` - Erreurs de permissions
- `ERR.System.*` - Erreurs système
- `ERR.Business.*` - Erreurs métier

---

### 3. Codes HTTP standards

| Code | Message traduit (FR) | Message traduit (EN) |
|------|---------------------|----------------------|
| 400 | Opération invalide | Invalid operation |
| 401 | Session expirée | Session expired |
| 403 | Accès refusé | Access denied |
| 404 | Ressource non trouvée | Resource not found |
| 408 | Délai d'attente dépassé | Timeout error |
| 409 | Entrée en double | Duplicate entry |
| 500 | Service indisponible | Service unavailable |
| 502 | Service indisponible | Service unavailable |
| 503 | Service indisponible | Service unavailable |
| 504 | Délai d'attente dépassé | Timeout error |

---

## 🛠️ Logging

Toutes les erreurs sont automatiquement loggées dans la console :

```
[RegistrationForm] API Error: {
  message: "ERR.General.EmailAlreadyExists",
  status: 400,
  validationErrors: [],
  timestamp: "2025-10-15T22:30:00.000Z"
}
```

**Note :** Le TODO dans le code indique qu'on peut ajouter un service de monitoring (Sentry, Azure Application Insights) plus tard.

---

## 🌍 Support multilingue (i18n)

Tous les messages sont automatiquement traduits selon la langue active :

```typescript
// Français (par défaut)
"Cet email existe déjà"

// Anglais
"This email already exists"
```

**Changement de langue :**
```typescript
this.i18n.setLanguage('en');  // Passe en anglais
this.i18n.setLanguage('fr');  // Passe en français
```

---

## ✅ Best Practices

### ✅ DO

```typescript
// ✅ Toujours passer un contexte pour le logging
this.errorHandler.handleApiError(error, 'MyComponent');

// ✅ Reset l'erreur avant une nouvelle soumission
this.errorMessage = '';
this.submit();

// ✅ Gérer les redirections 401/403
if (this.errorHandler.shouldRedirectToLogin(error)) {
  this.router.navigate(['/login']);
}
```

### ❌ DON'T

```typescript
// ❌ Ne pas hardcoder les messages d'erreur
this.errorMessage = 'Une erreur est survenue';

// ❌ Ne pas ignorer les erreurs
this.service.getData().subscribe(data => { /* ... */ });

// ❌ Ne pas logger manuellement (le service le fait)
console.error('Erreur:', error);
this.errorHandler.handleApiError(error);
```

---

## 🚀 Évolutions futures

- [ ] Intégration avec Azure Application Insights
- [ ] Support des retry automatiques
- [ ] Gestion des erreurs réseau (offline)
- [ ] Système de toast/notification global (optionnel)

---

## 📞 Support

Pour toute question ou amélioration, contacte l'équipe de développement.
