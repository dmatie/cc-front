# Guide d'utilisation de la localisation des champs

## Vue d'ensemble

Une fonction de localisation a été implémentée pour afficher automatiquement les champs traduits (comme `countryName` ou `countryNameFr`) selon la langue active de l'utilisateur.

## Solution implémentée

### 1. Méthode dans I18nService

**Fichier**: `src/app/services/i18n.service.ts`

```typescript
getLocalizedField<T>(obj: T, baseFieldName: string): string {
  const locale = this.getCurrentLocale();
  const localizedFieldName = locale === 'fr' ? `${baseFieldName}Fr` : baseFieldName;
  return (obj as any)[localizedFieldName] || (obj as any)[baseFieldName] || '';
}
```

### 2. Pipe Angular

**Fichier**: `src/app/core/utils/localized-field.pipe.ts`

Le pipe `LocalizedFieldPipe` permet d'utiliser la fonction dans les templates HTML de manière élégante.

## Comment appliquer à d'autres composants

### Étape 1: Identifier les champs à localiser

Chercher dans vos templates les champs qui ont des versions traduits:
- `functionName` → `functionNameFr`
- `countryName` → `countryNameFr`
- `businessProfileName` → `businessProfileNameFr`
- `financingTypeName` → `financingTypeNameFr`

### Étape 2: Importer le pipe dans le composant TypeScript

```typescript
import { LocalizedFieldPipe } from '../../core/utils/localized-field.pipe';

@Component({
  selector: 'app-your-component',
  imports: [CommonModule, LocalizedFieldPipe], // Ajouter LocalizedFieldPipe
  templateUrl: './your-component.html'
})
export class YourComponent {
  // ...
}
```

### Étape 3: Utiliser le pipe dans le template

**Avant:**
```html
<div>{{ accessRequest?.countryName }}</div>
<div>{{ accessRequest?.functionName }}</div>
```

**Après:**
```html
<div>{{ accessRequest | localizedField: 'countryName' }}</div>
<div>{{ accessRequest | localizedField: 'functionName' }}</div>
```

## Exemple complet: AccessRequestDetailComponent

### 1. Modifier le TypeScript

**Fichier**: `src/app/components/admin/access-request-detail.component.ts`

```typescript
import { LocalizedFieldPipe } from '../../core/utils/localized-field.pipe';

@Component({
  selector: 'app-access-request-detail',
  imports: [CommonModule, LocalizedFieldPipe], // Ajouter le pipe
  // ...
})
```

### 2. Modifier le template HTML

**Fichier**: `src/app/components/admin/access-request-detail.component.html`

Remplacer:
```html
<div>{{ accessRequest?.countryName }}</div>
```

Par:
```html
<div>{{ accessRequest | localizedField: 'countryName' }}</div>
```

## Composants à mettre à jour

Voici la liste des composants qui affichent des champs localisables:

### Composants Admin
- `access-request-detail.component` (lignes affichant countryName, functionName, etc.)
- `approved-access-request-detail.component`
- `user-detail.component`

### Composants Claims
- `claim-detail.component`

### Composants External Client
- `access-request-summary.component`

### Composants Register
- `registration-review.component`
- `amend-detail.component`

## Utilisation dans le TypeScript (alternative)

Si vous avez besoin d'accéder à la valeur dans le code TypeScript plutôt que dans le template:

```typescript
constructor(public i18n: I18nService) {}

getDisplayCountryName(accessRequest: AccessRequestDetail): string {
  return this.i18n.getLocalizedField(accessRequest, 'countryName');
}
```

## Avantages

- **Réactivité**: Le pipe `pure: false` garantit que les valeurs se mettent à jour automatiquement quand l'utilisateur change de langue
- **Fallback**: Si la version traduite n'existe pas, le système affiche automatiquement la version par défaut
- **Consistance**: Une seule méthode pour gérer toutes les localisations
- **Simplicité**: Syntaxe élégante dans les templates

## Implémentation actuelle

Le composant `request-details.component` utilise déjà cette solution et peut servir de référence:

**Fichier**: `src/app/components/request/request-details.component.html`
```html
<div>{{ registration | localizedField: 'functionName' }}</div>
<div>{{ registration | localizedField: 'countryName' }}</div>
<div>{{ registration | localizedField: 'businessProfileName' }}</div>
<div>{{ registration | localizedField: 'financingTypeName' }}</div>
```
