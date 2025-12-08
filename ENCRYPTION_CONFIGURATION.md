# Configuration de l'encryption - Guide complet

## 📋 Vue d'ensemble

L'application utilise un système d'encryption AES-GCM pour sécuriser les communications entre le frontend et le backend. Certains endpoints doivent être exclus de cette encryption, notamment ceux qui envoient des fichiers via FormData.

## 🔒 Fonctionnement de l'intercepteur

### Fichier : `src/app/interceptors/encryption-interceptor.ts`

L'intercepteur fonctionne en 3 étapes :

1. **Vérification si l'encryption est activée** (ligne 10-12)
2. **Matching des patterns d'exclusion** (ligne 20-27)
3. **Encryption/Décryption si nécessaire** (ligne 43-65)

### Logique de matching des patterns

```typescript
const shouldSkipEncryption = neverEncryptPaths.some(pattern => {
  const regexPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')  // Échappe les caractères spéciaux regex
    .replace(/\*/g, '[^/]+');                // Remplace * par [^/]+ (n'importe quoi sauf /)
  const regex = new RegExp(regexPattern, 'i');
  return regex.test(req.url);
});
```

**Exemples de matching :**

| Pattern                        | URL matchée                                                  | Match ? |
|--------------------------------|--------------------------------------------------------------|---------|
| `/api/disbursements`           | `https://backend.../api/disbursements`                       | ✅      |
| `/api/disbursements`           | `https://backend.../api/disbursements/123`                   | ❌      |
| `/api/accessrequests/*/submit` | `https://backend.../api/accessrequests/123/submit`           | ✅      |
| `/api/accessrequests/*/submit` | `https://backend.../api/accessrequests/abc-def-ghi/submit`   | ✅      |
| `/api/accessrequests/*/submit` | `https://backend.../api/accessrequests/123/edit`             | ❌      |

## 🚫 Endpoints exclus de l'encryption

### Configuration actuelle

Tous les fichiers d'environnement ont été mis à jour avec la configuration suivante :

```typescript
encryption: {
    enabled: true,
    key: 'Pzgq08B00AhKkVVA3cfmAJnk1EtgLPbn29cltULMlVs=',
    neverEncryptPaths: [
        '/api/disbursements',           // Endpoints disbursements (contiennent des fichiers)
        '/api/accessrequests/*/submit'  // Soumission de demandes d'accès (contient un fichier)
    ]
}
```

### Fichiers mis à jour

- ✅ `src/environments/environment.ts` (production)
- ✅ `src/environments/environment.development.ts`
- ✅ `src/environments/environment.qa.ts`
- ✅ `src/environments/environment.perso.ts`

## 📤 Endpoints avec upload de fichiers

### 1. Submit Access Request

**Fichier:** `src/app/services/implementations/registration-service.api.ts` (ligne 271)

```typescript
submitAccessRequest(id: string, registrationCode: string, document: File): Observable<RegistrationResponse> {
  const formData = new FormData();
  formData.append('AccessRequestId', id);
  formData.append('RegistrationCode', registrationCode);
  formData.append('Document', document);  // ← Fichier

  return this.http.post<RegistrationResponse>(`${this.apiUrl}/${id}/submit`, formData);
}
```

**Endpoint généré:** `POST /api/accessrequests/{id}/submit`

**Pourquoi exclure :** FormData avec fichier ne peut pas être sérialisé en JSON par `JSON.stringify()`

### 2. Disbursements

**Pattern:** `/api/disbursements`

Les endpoints de disbursements peuvent également contenir des fichiers et sont donc exclus de l'encryption.

## ⚠️ Problèmes évités

### Sans l'exclusion

Si l'endpoint `submitAccessRequest` n'était PAS dans `neverEncryptPaths` :

1. L'intercepteur essaierait d'appeler `encryptionService.encrypt(formData)`
2. Le service essaierait de faire `JSON.stringify(formData)` (ligne 39 de encryption.service.ts)
3. **CRASH** : FormData ne peut pas être converti en JSON
4. Erreur console : `"Encryption failed"`

```javascript
// ❌ CRASH - FormData n'est pas sérialisable
JSON.stringify(new FormData())
// TypeError: Converting circular structure to JSON
```

### Avec l'exclusion

1. L'intercepteur détecte le pattern `/api/accessrequests/*/submit`
2. L'encryption est **skippée** pour la requête
3. Le FormData est envoyé tel quel au backend
4. La réponse est **déchiffrée** si elle contient `EncryptedData` (ligne 32-40)

## 🔐 Comportement de l'encryption

### Requêtes (Request)

| Type de requête                | Body                  | Encryption appliquée ? |
|--------------------------------|-----------------------|------------------------|
| GET                            | Aucun                 | ❌ (pas de body)       |
| POST avec JSON                 | `{ key: "value" }`    | ✅ (si pas exclu)      |
| POST avec FormData             | FormData avec fichier | ❌ (doit être exclu)   |
| PUT/PATCH avec JSON            | `{ key: "value" }`    | ✅ (si pas exclu)      |
| DELETE                         | `{ key: "value" }`    | ✅ (si pas exclu)      |

### Réponses (Response)

| Type de réponse                          | Décryption appliquée ? |
|------------------------------------------|------------------------|
| JSON normal `{ success: true }`          | ❌                     |
| JSON chiffré `{ EncryptedData: "..." }`  | ✅                     |
| JSON chiffré `{ encryptedData: "..." }`  | ✅                     |

**Note:** La décryption des réponses est TOUJOURS tentée si la réponse contient `EncryptedData` ou `encryptedData`, même pour les endpoints exclus.

## 🛠️ Ajout d'un nouveau pattern d'exclusion

Si vous devez exclure un nouvel endpoint (par exemple, pour un upload de fichiers) :

1. **Identifier le pattern de l'endpoint**
   - Exemple : `/api/documents/{id}/upload`
   - Pattern avec wildcard : `/api/documents/*/upload`

2. **Ajouter dans TOUS les environnements**

```typescript
neverEncryptPaths: [
    '/api/disbursements',
    '/api/accessrequests/*/submit',
    '/api/documents/*/upload'  // ← Nouveau pattern
]
```

3. **Tester le matching**
   - Vérifier que le pattern match l'URL complète
   - Utiliser des wildcards `*` pour les segments dynamiques (ID, GUID, etc.)

## 🧪 Tests de validation

### Test 1 : Vérifier qu'un endpoint est exclu

```typescript
// Dans les DevTools du navigateur
const pattern = '/api/accessrequests/*/submit';
const url = 'https://backend.../api/accessrequests/123/submit';

const regexPattern = pattern
  .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
  .replace(/\*/g, '[^/]+');

const regex = new RegExp(regexPattern, 'i');
console.log(regex.test(url));  // Devrait afficher : true
```

### Test 2 : Vérifier que FormData n'est pas chiffré

1. Ouvrir DevTools → Network
2. Soumettre un formulaire avec fichier
3. Vérifier dans la requête :
   - Content-Type devrait être `multipart/form-data`
   - Le body ne devrait PAS contenir `{ encryptedData: "..." }`

## 📚 Références

- Intercepteur : `src/app/interceptors/encryption-interceptor.ts`
- Service d'encryption : `src/app/services/encryption.service.ts`
- Service API : `src/app/services/implementations/registration-service.api.ts`
- Environnements : `src/environments/environment*.ts`

## 🎯 Points clés à retenir

1. ✅ Les endpoints avec **FormData + fichiers** DOIVENT être exclus
2. ✅ Utiliser des **wildcards** `*` pour les segments dynamiques (IDs)
3. ✅ Mettre à jour **TOUS** les environnements (dev, qa, perso, prod)
4. ✅ La décryption des réponses fonctionne **même pour les endpoints exclus**
5. ✅ Tester après chaque ajout de pattern
