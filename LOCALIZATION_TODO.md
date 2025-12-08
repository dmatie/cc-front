# Liste des composants à mettre à jour avec la localisation

## ✅ Composant déjà mis à jour

- [x] **request-details.component** - Implémenté et testé

## 📋 Composants à mettre à jour

### 🔴 Priorité haute (affichage détails des demandes)

#### 1. approved-access-request-detail.component
**Fichier TS**: `src/app/components/admin/approved-access-request-detail.component.ts`
**Fichier HTML**: `src/app/components/admin/approved-access-request-detail.component.html`

Lignes à modifier:
- Ligne 80: `{{ accessRequest.functionName }}` → `{{ accessRequest | localizedField: 'functionName' }}`
- Ligne 96: `{{ accessRequest.countryName }}` → `{{ accessRequest | localizedField: 'countryName' }}`
- Ligne 100: `{{ accessRequest.businessProfileName }}` → `{{ accessRequest | localizedField: 'businessProfileName' }}`
- Ligne 105: `{{ accessRequest.financingTypeName }}` → `{{ accessRequest | localizedField: 'financingTypeName' }}`

#### 2. access-request-summary.component
**Fichier TS**: `src/app/components/external-client/access-request-summary.component.ts`
**Fichier HTML**: `src/app/components/external-client/access-request-summary.component.html`

Lignes à modifier:
- Ligne 76: `{{ accessRequest.functionName }}` → `{{ accessRequest | localizedField: 'functionName' }}`
- Ligne 93: `{{ accessRequest.countryName }}` → `{{ accessRequest | localizedField: 'countryName' }}`
- Ligne 97: `{{ accessRequest.businessProfileName }}` → `{{ accessRequest | localizedField: 'businessProfileName' }}`
- Ligne 102: `{{ accessRequest.financingTypeName }}` → `{{ accessRequest | localizedField: 'financingTypeName' }}`

#### 3. amend-detail.component
**Fichier TS**: `src/app/components/register/amend-detail.component.ts`
**Fichier HTML**: `src/app/components/register/amend-detail.component.html`

Lignes à modifier:
- Ligne 62: `{{ registration.accessRequest.functionName }}` → `{{ registration.accessRequest | localizedField: 'functionName' }}`
- Ligne 68: `{{ registration.accessRequest.countryName }}` → `{{ registration.accessRequest | localizedField: 'countryName' }}`
- Ligne 72: `{{ registration.accessRequest.businessProfileName }}` → `{{ registration.accessRequest | localizedField: 'businessProfileName' }}`
- Ligne 76: `{{ registration.accessRequest.financingTypeName }}` → `{{ registration.accessRequest | localizedField: 'financingTypeName' }}`

### 🟡 Priorité moyenne (affichage dans les tableaux)

#### 4. approved-access-requests-list.component
**Fichier TS**: `src/app/components/admin/approved-access-requests-list.component.ts`
**Fichier HTML**: `src/app/components/admin/approved-access-requests-list.component.html`

Lignes à modifier:
- Ligne 132: `{{ request.countryName }}` → `{{ request | localizedField: 'countryName' }}`
- Ligne 134: `{{ request.businessProfileName }}` → `{{ request | localizedField: 'businessProfileName' }}`

#### 5. access-request-list.component
**Fichier TS**: `src/app/components/admin/access-request-list.component.ts`
**Fichier HTML**: `src/app/components/admin/access-request-list.component.html`

Lignes à modifier:
- Ligne 55: `{{ request.financingTypeName }}` → `{{ request | localizedField: 'financingTypeName' }}`

#### 6. claim-detail.component
**Fichier TS**: `src/app/components/claims/claim-detail.component.ts`
**Fichier HTML**: `src/app/components/claims/claim-detail.component.html`

Lignes à modifier:
- Ligne 53: `{{ claim.countryName }}` → `{{ claim | localizedField: 'countryName' }}`

#### 7. external-claims-list.component
**Fichier TS**: `src/app/components/claims/external-claims-list.component.ts`
**Fichier HTML**: `src/app/components/claims/external-claims-list.component.html`

Lignes à modifier:
- Ligne 67: `{{ claim.countryName }}` → `{{ claim | localizedField: 'countryName' }}`

#### 8. internal-claims-list.component
**Fichier TS**: `src/app/components/claims/internal-claims-list.component.ts`
**Fichier HTML**: `src/app/components/claims/internal-claims-list.component.html`

Lignes à modifier:
- Ligne 110: `{{ claim.countryName }}` → `{{ claim | localizedField: 'countryName' }}`

### 🟢 Priorité basse (affichage utilisateurs)

#### 9. user-detail.component
**Fichier TS**: `src/app/components/admin/user-detail.component.ts`
**Fichier HTML**: `src/app/components/admin/user-detail.component.html`

Lignes à modifier:
- Ligne 145: `{{ country.countryName }}` → `{{ country | localizedField: 'countryName' }}`

#### 10. internal-users-list.component
**Fichier TS**: `src/app/components/admin/internal-users-list.component.ts`
**Fichier HTML**: `src/app/components/admin/internal-users-list.component.html`

Lignes à modifier:
- Ligne 101: `{{ country.countryName }}` → `{{ country | localizedField: 'countryName' }}`

## 📝 Instructions pour chaque composant

Pour chaque composant à mettre à jour:

### 1. Modifier le fichier TypeScript (.ts)

Ajouter l'import du pipe:
```typescript
import { LocalizedFieldPipe } from '../../core/utils/localized-field.pipe';
```

Ajouter le pipe dans le tableau `imports` du décorateur `@Component`:
```typescript
@Component({
  selector: 'app-your-component',
  imports: [CommonModule, LocalizedFieldPipe], // Ajouter LocalizedFieldPipe
  // ...
})
```

### 2. Modifier le fichier HTML

Remplacer chaque occurrence selon le pattern:
```html
<!-- Avant -->
{{ object.fieldName }}

<!-- Après -->
{{ object | localizedField: 'fieldName' }}
```

### 3. Tester

Après chaque modification:
1. Compiler: `npm run build`
2. Vérifier qu'il n'y a pas d'erreurs
3. Tester en changeant de langue (EN/FR)

## 🎯 Ordre de mise à jour recommandé

1. **access-request-summary.component** (utilisé par les clients externes)
2. **approved-access-request-detail.component** (utilisé par les admins)
3. **amend-detail.component** (processus d'amendement)
4. **claim-detail.component** (détails des réclamations)
5. Les composants de listes (moins prioritaires)

## ✨ Bénéfices attendus

Une fois tous les composants mis à jour:
- Affichage automatique dans la bonne langue
- Changement de langue instantané sans rechargement
- Code plus maintenable et cohérent
- Expérience utilisateur améliorée
