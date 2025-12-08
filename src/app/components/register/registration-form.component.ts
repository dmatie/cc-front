import { Component, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { I18nService } from '../../services/i18n.service';
import { AbstractDropdownService } from '../../services/abstract/dropdown-service.abstract';
import { AbstractRegistrationService } from '../../services/abstract/registration-service.abstract';
import { RegistrationRequest } from '../../models/registration.model';
import { Country, UserFunction, BusinessProfile, FinancingType } from '../../models/dropdown.model';
import { Project, ProjectsResponse } from '../../models/project.model';
import { AbstractProjectsService } from '../../services/abstract/projects-service.abstract';

@Component({
  selector: 'app-registration-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.css']
})
export class RegistrationFormComponent implements OnInit, OnDestroy {
  registrationForm: FormGroup;
  isSubmitting = false;
  submitError = '';
  fieldErrors: { [key: string]: string } = {};

  // DONNÉES DES LISTES DÉROULANTES
  countries: Country[] = [];
  functions: UserFunction[] = [];
  businessProfiles: BusinessProfile[] = [];
  financingTypes: FinancingType[] = [];
  projects: Project[] = [];
  selectedProjectCodes: string[] = [];

  // ÉTATS DE CHARGEMENT
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
    private projectsService: AbstractProjectsService
  ) {
    console.log(' RegistrationFormComponent constructor called');

    this.registrationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      functionId: ['', Validators.required],
      countryId: ['', Validators.required],
      businessProfileId: ['', Validators.required],
      financingTypeId: ['', Validators.required],
      selectedProjectCodes: [[], Validators.required]
    });

    console.log(' Form created with signals');

    // Écouter les changements de pays pour charger les projets
    this.registrationForm.get('countryId')?.valueChanges.subscribe(countryId => {
      if (countryId) {
        this.loadProjectsForCountry(countryId);
      } else {
        this.projects = [];
        this.selectedProjectCodes = [];
        this.registrationForm.patchValue({ selectedProjectCodes: [] });
      }
    });
  }

  ngOnInit(): void {
    console.log('🔄 ngOnInit called');

    // CHARGER LES DONNÉES DES LISTES DÉROULANTES
    this.loadDropdownData();
  }

  ngOnDestroy(): void {
    console.log('🔄 Component destroyed');
  }

  // CHARGER LES DONNÉES DES LISTES DÉROULANTES
  private loadDropdownData(): void {

    // Charger les pays
    this.loadCountries();

    // Charger les fonctions
    this.loadFunctions();

    // Charger les profils d'entreprise
    this.loadBusinessProfiles();

    // Charger les types de financement
    this.loadFinancingTypes();
  }

  private loadProjectsForCountry(countryId: string): void {
    // Trouver le code du pays
    const selectedCountry = this.countries.find(c => c.id === countryId);
    if (!selectedCountry) {
      console.warn('Pays non trouvé pour ID:', countryId);
      return;
    }

    this.isLoadingProjects = true;
    this.projects = [];
    this.selectedProjectCodes = [];
    this.registrationForm.patchValue({ selectedProjectCodes: [] });

    this.projectsService.getProjectsByCountry(selectedCountry.code).subscribe({
      next: (response: ProjectsResponse) => {
        this.projects = response.projects;
        this.isLoadingProjects = false;
      },
      error: (error) => {
          console.error('Error loading projects:', error);
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
        } else {
          console.error('Failed to load countries:', response.message);
        }
        this.isLoadingCountries = false;
      },
      error: (error) => {
        console.error('Error loading countries:', error);
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
        } else {
          console.error('Failed to load functions:', response.message);
        }
        this.isLoadingFunctions = false;
      },
      error: (error) => {
        console.error('Error loading functions:', error);
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
        } else {
          console.error('Failed to load business profiles:', response.message);
        }
        this.isLoadingBusinessProfiles = false;
      },
      error: (error) => {
        console.error('Error loading business profiles:', error);
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
        } else {
          console.error('Failed to load financing types:', response.message);
        }
        this.isLoadingFinancingTypes = false;
      },
      error: (error) => {
        console.error('Error loading financing types:', error);
        this.isLoadingFinancingTypes = false;
      }
    });
  }


  onSubmit(): void {
    if (this.registrationForm.valid) {
      this.isSubmitting = true;
      this.submitError = '';
      this.fieldErrors = {};

      const formData = this.registrationForm.value;

      formData.selectedProjectCodes = Array.isArray(this.selectedProjectCodes)
        ? this.selectedProjectCodes
        : [];

      formData.countryName = this.getCountryName(formData.countryId);
      formData.countryNameFr = this.getCountryNameFr(formData.countryId);
      formData.businessProfileName = this.getBusinessProfileName(formData.businessProfileId);
      formData.businessProfileNameFr = this.getBusinessProfileNameFr(formData.businessProfileId);
      formData.financingTypeName = this.getFinancingTypeName(formData.financingTypeId);
      formData.financingTypeNameFr = this.getFinancingTypeNameFr(formData.financingTypeId);
      formData.functionName = this.getFunctionName(formData.functionId);
      formData.functionNameFr = this.getFunctionNameFr(formData.functionId);

      // Créer un mapping de sapCode => projectName
      formData.projectNames = {};
      this.selectedProjectCodes.forEach(code => {
        const project = this.projects.find(p => p.sapCode === code);
        if (project) {
          formData.projectNames[code] = project.projectName;
        }
      });

      const email = this.registrationForm.get('email')?.value;

      // Envoyer le code de vérification
      this.registrationService.sendVerificationCode(email, false).subscribe({
        next: (response) => {
          if (response.success) {
            // Stocker les données pour la page de révision
            sessionStorage.setItem('registrationReviewData', JSON.stringify(formData));
            this.router.navigate(['/register/review']);
          } else {
            this.submitError = response.message || this.i18n.t('registration_form.send_code_error');
            this.isSubmitting = false;
          }
        },
        error: (error) => {
          this.submitError = error.message || this.i18n.t('registration_form.send_code_error');
          this.isSubmitting = false;
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

    this.registrationForm.patchValue({ selectedProjectCodes: this.selectedProjectCodes });
  }

  isProjectSelected(projectCode: string): boolean {
    return this.selectedProjectCodes.includes(projectCode);
  }

  selectAllProjects(): void {
    this.selectedProjectCodes = this.projects.map(p => p.sapCode);
    this.registrationForm.patchValue({ selectedProjectCodes: this.selectedProjectCodes });
  }

  deselectAllProjects(): void {
    this.selectedProjectCodes = [];
    this.registrationForm.patchValue({ selectedProjectCodes: [] });
  }

  areAllProjectsSelected(): boolean {
    return this.projects.length > 0 && this.selectedProjectCodes.length === this.projects.length;
  }

  goBack(): void {
    this.router.navigate(['/register/confidentiality']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registrationForm.controls).forEach(key => {
      const control = this.registrationForm.get(key);
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

  getCountryName(id: string): string {
    const country = this.countries.find(c => c.id === id);
    return country ? country.name : '';
  }

  getCountryNameFr(id: string): string {
    const country = this.countries.find(c => c.id === id);
    return country ? country.nameFr : '';
  }

  getBusinessProfileName(id: string): string {
    const bp = this.businessProfiles.find(b => b.id === id);
    return bp ? bp.name : '';
  }

  getBusinessProfileNameFr(id: string): string {
    const bp = this.businessProfiles.find(b => b.id === id);
    return bp ? bp.nameFr : '';
  }

  getFinancingTypeName(id: string): string {
    const ft = this.financingTypes.find(f => f.id === id);
    return ft ? ft.name : '';
  }

  getFinancingTypeNameFr(id: string): string {
    const ft = this.financingTypes.find(f => f.id === id);
    return ft ? ft.nameFr : '';
  }

  getFunctionName(id: string): string {
    const fn = this.functions.find(f => f.id === id);
    return fn ? fn.name : '';
  }

  getFunctionNameFr(id: string): string {
    const fn = this.functions.find(f => f.id === id);
    return fn ? fn.nameFr : '';
  }

  getCountryLabel(country: Country): string {
    return this.i18n.getCurrentLocale() === 'fr' ? country.nameFr : country.name;
  }

  getBusinessProfileLabel(profile: BusinessProfile): string {
    return this.i18n.getCurrentLocale() === 'fr' ? profile.nameFr : profile.name;
  }

  getFinancingTypeLabel(type: FinancingType): string {
    return this.i18n.getCurrentLocale() === 'fr' ? type.nameFr : type.name;
  }

  getFunctionLabel(func: UserFunction): string {
    return this.i18n.getCurrentLocale() === 'fr' ? func.nameFr : func.name;
  }

}
