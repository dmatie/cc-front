# Claims API Implementation Summary

## ✅ Completed Implementation

### 1. Models Updated (`src/app/models/claim.model.ts`)
- ✅ Updated `Claim` interface to match API response
- ✅ Updated `ClaimProcess` interface to match API response
- ✅ Changed `ClaimStatus` enum to use numeric values (Submitted=1, InProgress=2, Closed=3)
- ✅ Added `ClaimType` interface
- ✅ Added `ClaimTypesResponse` interface
- ✅ Updated DTOs (`CreateClaimDto`, `CreateClaimProcessDto`)
- ✅ Added helper function `getClaimStatusLabel()` for translations

### 2. Service Architecture Created
- ✅ Created abstract service: `src/app/services/abstract/claim-service.abstract.ts`
- ✅ Created API implementation: `src/app/services/implementations/claim-service.api.ts`
- ✅ Created Mock implementation: `src/app/services/implementations/claim-service.mock.ts`
- ✅ Added factory in `service.factories.ts`
- ✅ Configured provider in `app.config.ts`

### 3. Dropdown Service Extended
- ✅ Added `getClaimTypes()` method to abstract service
- ✅ Implemented in API service (`dropdown-service.api.ts`)
- ✅ Implemented in Mock service (`dropdown-service.mock.ts`)

### 4. Auth Service Enhanced
- ✅ Added `customUserId` property for future user ID storage

### 5. Old Service Removed
- ✅ Deleted obsolete `claim-mock.service.ts`

## 🔄 Components That Need Updating

The following components still reference the old service structure and need to be updated:

1. **external-claims-list.component.ts**
2. **internal-claims-list.component.ts**
3. **claim-response-modal.component.ts**
4. **create-claim-modal.component.ts**
5. **claim-detail.component.ts**

### Required Changes in Components:

#### Import Changes
```typescript
// OLD
import { ClaimMockService } from '../../services/claim-mock.service';
import { Claim, ClaimStatus } from '../../models/claim.model';

// NEW
import { ClaimService } from '../../services/abstract/claim-service.abstract';
import { Claim, ClaimStatus, getClaimStatusLabel } from '../../models/claim.model';
import { AbstractDropdownService } from '../../services/abstract/dropdown-service.abstract';
```

#### Constructor Changes
```typescript
// OLD
constructor(
  private claimService: ClaimMockService,
  ...
)

// NEW
constructor(
  private claimService: ClaimService,
  private dropdownService: AbstractDropdownService,
  ...
)
```

#### Property Mapping Changes
The API returns different property names:

| Old Property | New Property | Notes |
|-------------|--------------|-------|
| `claim.claimType` | `claim.claimTypeName` or `claim.claimTypeNameFr` | Use based on language |
| `claim.country` | `claim.countryName` | |
| `claim.user` | `claim.userFullName` or `claim.userEmail` | |
| `process.user` | `process.userFullName` | |
| `ClaimStatus.PENDING` | `ClaimStatus.Submitted` | |
| `ClaimStatus.IN_PROGRESS` | `ClaimStatus.InProgress` | |
| `ClaimStatus.RESOLVED` | `ClaimStatus.Closed` | No more RESOLVED status |
| `ClaimStatus.REJECTED` | N/A | Status removed |

#### Service Method Changes

**Get All Claims (Internal)**
```typescript
// OLD
this.claimService.getClaims().subscribe(...)

// NEW
this.claimService.getClaims({
  status: this.selectedStatus,
  pageNumber: 1,
  pageSize: 100
}).subscribe(...)
```

**Get User Claims (External)**
```typescript
// OLD
this.claimService.getClaimsByUser(userEmail).subscribe(...)

// NEW
this.claimService.getClaimsByUser({
  userId: this.authService.customUserId!, // Will be set from endpoint
  status: this.selectedStatus,
  pageNumber: 1,
  pageSize: 100
}).subscribe(...)
```

**Create Claim**
```typescript
// OLD
const dto: CreateClaimDto = {
  claimType: this.claimType,
  country: this.country,
  comment: this.comment
};
this.claimService.createClaim(dto, userEmail).subscribe(...)

// NEW
const dto: CreateClaimDto = {
  claimTypeId: this.claimTypeId,  // GUID from dropdown
  userId: this.authService.customUserId!,
  countryId: this.countryId,  // GUID from dropdown
  comment: this.comment
};
this.claimService.createClaim(dto).subscribe(response => {
  // response = { claim: Claim, message: string }
  ...
})
```

**Add Response to Claim**
```typescript
// OLD
const dto: CreateClaimProcessDto = {
  claimId: this.claimId,
  status: this.status,
  comment: this.comment
};
this.claimService.createClaimProcess(dto, userEmail).subscribe(...)

// NEW
const dto: CreateClaimProcessDto = {
  claimId: this.claimId,
  userId: this.authService.customUserId!,
  status: this.status,
  comment: this.comment
};
this.claimService.createClaimProcess(this.claimId, dto).subscribe(...)
```

#### Dropdown Integration for Create Claim Modal

```typescript
// Load claim types
this.dropdownService.getClaimTypes().subscribe(response => {
  this.claimTypes = response.claimTypes;
});

// Load countries
this.dropdownService.getCountries().subscribe(response => {
  this.countries = response.data;
});

// Template binding
<select [(ngModel)]="claimTypeId">
  @for (type of claimTypes; track type.id) {
    <option [value]="type.id">
      {{ currentLang === 'fr' ? type.nameFr : type.name }}
    </option>
  }
</select>
```

#### Status Display
```typescript
// Use helper function
import { getClaimStatusLabel } from '../../models/claim.model';

// In template
{{ getClaimStatusLabel(claim.status, currentLang) }}
```

## 📝 TODO: Next Steps

1. **Update all 5 components** listed above with the new structure
2. **Implement user ID endpoint** (you mentioned you'll provide details later)
   - Add endpoint call to populate `authService.customUserId`
   - This should be called after authentication
3. **Test with Mock Data** first (environment.features.enableMockData = true)
4. **Switch to API** when backend is ready (environment.features.enableMockData = false)

## 🔍 Error Handling

The API returns errors in this format:
```json
{
  "message": "Error message or translation key",
  "errors": [
    {
      "field": "propertyName",
      "error": "error message"
    }
  ]
}
```

Handle in components:
```typescript
error => {
  if (error.message) {
    this.errorMessage = this.i18n.t(error.message);
  }
  if (error.errors) {
    // Handle validation errors
  }
}
```

## ⚙️ Environment Configuration

Already configured in `environment.ts`:
- `apiUrl`: Base API URL
- `features.enableMockData`: Toggle between mock and real API

## 🎯 Benefits of This Architecture

1. **Separation of Concerns**: Abstract service defines contract, implementations provide behavior
2. **Easy Testing**: Can switch between mock and real API via configuration
3. **Type Safety**: Full TypeScript support with proper interfaces
4. **Maintainability**: Changes to API only affect one file
5. **Scalability**: Easy to add new methods or implementations
