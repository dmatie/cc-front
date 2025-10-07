import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { I18nService } from '../../services/i18n.service';
import { AbstractDropdownService } from '../../services/abstract/dropdown-service.abstract';
import { AbstractRegistrationService } from '../../services/abstract/registration-service.abstract';
import { AbstractProjectsService } from '../../services/abstract/projects-service.abstract';
import { ErrorTranslationService } from '../../services/error-translation.service';
import { AmendRegistrationRequest, RegistrationDetail } from '../../models/registration.model';
import { Country, UserFunction, BusinessProfile, FinancingType } from '../../models/dropdown.model';
import { Project, ProjectsResponse } from '../../models/project.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-amend-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './amend-edit.component.html',
  styleUrls: ['./amend-edit.component.css']
})
export class AmendEditComponent implements OnInit, OnDestroy {
  amendForm: FormGroup;
  registration: RegistrationDetail | null = null;
  isSubmitting = false;
  submitError = '';
  fieldErrors: { [key: string]: string } = {};

  // Données des listes déroulantes
  countries: Country[] = [];
  functions: UserFunction[] = [];
  businessProfiles: BusinessProfile[] = [];
  financingTypes: FinancingType[] = [];
  projects: Project[] = [];
  selectedProjectCodes: string[] = [];
  
  // États de chargement
  isLoadingCountries = false;
  isLoadingFunctions = false;
  isLoadingBusinessProfiles = false;
  isLoadingFinancingTypes = false;
  isLoadingProjects = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public i18n: I18nService,
    private dropdownService: AbstractDropdownService,
    private registrationService: AbstractRegistrationService,
    private projectsService: AbstractProjectsService,
    private errorTranslation: ErrorTranslationService
  ) {
    this.amendForm = this.fb.group({
      email: [{ value: '', disabled: true }],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      functionId: ['', Validators.required],
      countryId: ['', Validators.required],
      businessProfileId: ['', Validators.required],
      financingTypeId: ['', Validators.required],
      selectedProjectCodes: [[], Validators.required]
    });

    // Écouter les changements de pays
    this.amendForm.get('countryId')?.valueChanges.subscribe(countryId => {
      if (countryId) {
        this.loadProjectsForCountry(countryId);
      } else {
        this.projects = [];
        this.selectedProjectCodes = [];
        this.amendForm.patchValue({ selectedProjectCodes: [] });
      }
    });
  }

  ngOnInit(): void {
    // Récupérer les données depuis la session
    const registrationData = sessionStorage.getItem('amendRegistrationData');
    if (!registrationData) {
      this.router.navigate(['/register/amend']);
      return;
    }

    try {
      this.registration = JSON.parse(registrationData);
      this.loadDropdownDataAndPopulate();
      //this.loadDropdownData();
      //this.populateForm();
    } catch (error) {
      console.error('Erreur lors du parsing des données:', error);
      this.router.navigate(['/register/amend']);
    }
  }

  ngOnDestroy(): void {
    // Nettoyer les données de session si on quitte sans sauvegarder
  }

  private loadDropdownDataAndPopulate(): void {
  forkJoin({
    countries: this.dropdownService.getCountries({ isActive: true }),
    functions: this.dropdownService.getFunctions({ isActive: true }),
    businessProfiles: this.dropdownService.getBusinessProfiles({ isActive: true }),
    financingTypes: this.dropdownService.getFinancingTypes({ isActive: true }),
  }).subscribe({
    next: (responses) => {
      if (responses.countries.success) this.countries = responses.countries.data;
      if (responses.functions.success) this.functions = responses.functions.data;
      if (responses.businessProfiles.success) this.businessProfiles = responses.businessProfiles.data;
      if (responses.financingTypes.success) this.financingTypes = responses.financingTypes.data;

      // Maintenant on peut remplir le formulaire
      this.populateForm();
    },
    error: (err) => {
      console.error('Erreur lors du chargement des dropdowns:', err);
    }
  });
}

  private loadDropdownData(): void {
    this.loadCountries();
    this.loadFunctions();
    this.loadBusinessProfiles();
    this.loadFinancingTypes();
  }

  private populateForm(): void {
    if (this.registration) {
      this.selectedProjectCodes = [...this.registration.accessRequest.selectedProjectCodes];
      
      this.amendForm.patchValue({
        email: this.registration.accessRequest.email,
        firstName: this.registration.accessRequest.firstName,
        lastName: this.registration.accessRequest.lastName,
        functionId: this.registration.accessRequest.functionId,
        countryId: this.registration.accessRequest.countryId,
        businessProfileId: this.registration.accessRequest.businessProfileId,
        financingTypeId: this.registration.accessRequest.financingTypeId,
        selectedProjectCodes: this.selectedProjectCodes
      });

      // Charger les projets pour le pays sélectionné
      if (this.registration.accessRequest.countryId) {
        this.selectedProjectCodes = [...this.registration.accessRequest.selectedProjectCodes];
        this.loadProjectsForCountry(this.registration.accessRequest.countryId, true);
      }
    }
  }

  private loadProjectsForCountry(countryId: string, isLoad: boolean = false): void {
    const selectedCountry = this.countries.find(c => c.id === countryId);
    if (!selectedCountry) return;
    
    this.isLoadingProjects = true;
    this.projects = [];
    if (!isLoad)
    {
      this.selectedProjectCodes = [];
      this.amendForm.patchValue({ selectedProjectCodes: [] });
    }
    else{
      this.amendForm.patchValue({ selectedProjectCodes: this.selectedProjectCodes });
    }

    
    
    this.projectsService.getProjectsByCountry(selectedCountry.code).subscribe({
      next: (response: ProjectsResponse) => {
        this.projects = response.projects;
        this.isLoadingProjects = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des projets:', error);
        this.isLoadingProjects = false;
        this.projects = [];
      }
    });
  }

  private loadCountries(): void {
    this.isLoadingCountries = true;
    this.dropdownService.getCountries({ isActive: true }).subscribe({
      next: (response) => {
        if (response.success) {
          this.countries = response.data;
        }
        this.isLoadingCountries = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des pays:', error);
        this.isLoadingCountries = false;
      }
    });
  }

  private loadFunctions(): void {
    this.isLoadingFunctions = true;
    this.dropdownService.getFunctions({ isActive: true }).subscribe({
      next: (response) => {
        if (response.success) {
          this.functions = response.data;
        }
        this.isLoadingFunctions = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des fonctions:', error);
        this.isLoadingFunctions = false;
      }
    });
  }

  private loadBusinessProfiles(): void {
    this.isLoadingBusinessProfiles = true;
    this.dropdownService.getBusinessProfiles({ isActive: true }).subscribe({
      next: (response) => {
        if (response.success) {
          this.businessProfiles = response.data;
        }
        this.isLoadingBusinessProfiles = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des profils:', error);
        this.isLoadingBusinessProfiles = false;
      }
    });
  }

  private loadFinancingTypes(): void {
    this.isLoadingFinancingTypes = true;
    this.dropdownService.getFinancingTypes({ isActive: true }).subscribe({
      next: (response) => {
        if (response.success) {
          this.financingTypes = response.data;
        }
        this.isLoadingFinancingTypes = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des types de financement:', error);
        this.isLoadingFinancingTypes = false;
      }
    });
  }

  onSubmit(): void {
    if (this.amendForm.valid && this.registration) {
      this.isSubmitting = true;
      this.submitError = '';

      // Convertir selectedProjectCodes en Projects avec le format attendu par l'API
      const projects = this.selectedProjectCodes.map(code => ({ sapCode: code }));

      const amendRequest: AmendRegistrationRequest = {
        id: this.registration.accessRequest.id,
        email: this.registration.accessRequest.email,
        firstName: this.amendForm.get('firstName')?.value,
        lastName: this.amendForm.get('lastName')?.value,
        functionId: this.amendForm.get('functionId')?.value,
        countryId: this.amendForm.get('countryId')?.value,
        businessProfileId: this.amendForm.get('businessProfileId')?.value,
        financingTypeId: this.amendForm.get('financingTypeId')?.value,
        Projects: projects
      };
      
      this.registrationService.updateRegistration(amendRequest).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          
          // Nettoyer la session
          sessionStorage.removeItem('amendEmail');
          sessionStorage.removeItem('amendRegistrationData');
          
          // Stocker les données de succès
          sessionStorage.setItem('registrationRequestId', response.accessRequest.id);
          sessionStorage.setItem('registrationMessage', response.message);
          
          // Rediriger vers la page de succès
          this.router.navigate(['/register/success']);
        },
        error: (errorResponse) => {
          console.error('Erreur lors de la mise à jour:', errorResponse);
          this.isSubmitting = false;
          
          if (errorResponse.errors && errorResponse.errors.length > 0) {
            this.fieldErrors = {};
            errorResponse.errors.forEach((error: any) => {
              const fieldName = this.mapFieldName(error.field);
              this.fieldErrors[fieldName] = this.errorTranslation.translateErrorCode(error.error);
            });
            this.submitError = errorResponse.message || 'Erreurs de validation';
          } else {
            this.submitError = errorResponse.message || 'Une erreur est survenue';
            this.fieldErrors = {};
          }
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onProjectSelectionChange(projectCode: string, isSelected: boolean): void {
    if (isSelected) {
      if (!this.selectedProjectCodes.includes(projectCode)) {
        this.selectedProjectCodes.push(projectCode);
      }
    } else {
      const index = this.selectedProjectCodes.indexOf(projectCode);
      if (index > -1) {
        this.selectedProjectCodes.splice(index, 1);
      }
    }
    
    this.amendForm.patchValue({ selectedProjectCodes: this.selectedProjectCodes });
  }

  isProjectSelected(projectCode: string): boolean {
    return this.selectedProjectCodes.includes(projectCode);
  }

  goBack(): void {
    this.router.navigate(['/register/detail']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.amendForm.controls).forEach(key => {
      const control = this.amendForm.get(key);
      control?.markAsTouched();
    });
  }

  private mapFieldName(apiFieldName: string): string {
    const fieldMapping: { [key: string]: string } = {
      'Function': 'functionid',
      'Country': 'countryid',
      'BusinessProfile': 'businessprofileid',
      'FinancingType': 'financingtypeid',
      'Email': 'email',
      'FirstName': 'firstname',
      'LastName': 'lastname'
    };
    
    return fieldMapping[apiFieldName] || apiFieldName.toLowerCase();
  }

  getFieldError(fieldName: string): string | null {
    return this.fieldErrors[fieldName.toLowerCase()] || null;
  }

  hasFieldError(fieldName: string): boolean {
    return !!this.fieldErrors[fieldName.toLowerCase()];
  }

  hasAnyFieldErrors(): boolean {
    return Object.keys(this.fieldErrors).length > 0;
  }

  getFieldErrorMessages(): string[] {
    return Object.values(this.fieldErrors);
  }
}