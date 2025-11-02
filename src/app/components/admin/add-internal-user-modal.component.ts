import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { I18nService } from '../../services/i18n.service';
import { AbstractUserManagementService } from '../../services/abstract/user-management-service.abstract';
import { AbstractDropdownService } from '../../services/abstract/dropdown-service.abstract';
import { UserRole, AzureAdUserDetailsDto, CreateInternalUserRequest } from '../../models/user-management.model';
import { Country } from '../../models/dropdown.model';

@Component({
  selector: 'app-add-internal-user-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-internal-user-modal.component.html',
  styleUrls: ['./add-internal-user-modal.component.css']
})
export class AddInternalUserModalComponent implements OnInit {
  @Output() userAdded = new EventEmitter<void>();
  @Output() modalClosed = new EventEmitter<void>();

  userForm: FormGroup;
  searchControl = new FormControl('');

  azureUsers: AzureAdUserDetailsDto[] = [];
  selectedAzureUser: AzureAdUserDetailsDto | null = null;
  countries: Country[] = [];

  isSearching = false;
  isSaving = false;
  showResults = false;
  errorMessage = '';

  UserRole = UserRole;
  userRoles = [
    { value: UserRole.Admin, label: 'users.roles.admin' },
    { value: UserRole.DO, label: 'users.roles.do' },
    { value: UserRole.DA, label: 'users.roles.da' }
  ];

  constructor(
    private fb: FormBuilder,
    private userManagementService: AbstractUserManagementService,
    private dropdownService: AbstractDropdownService,
    public i18n: I18nService
  ) {
    this.userForm = this.fb.group({
      role: [null, Validators.required],
      countryIds: [[]]
    });
  }

  ngOnInit(): void {
    this.loadCountries();
    this.setupSearch();
    this.setupRoleChangeListener();
  }

  private loadCountries(): void {
    this.dropdownService.getCountries().subscribe({
      next: (response) => {
        this.countries = response.data;
      },
      error: (error) => {
        console.error('Error loading countries:', error);
      }
    });
  }

  private setupSearch(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.searchAzureUsers(term || ''))
    ).subscribe();
  }

  private setupRoleChangeListener(): void {
    this.userForm.get('role')?.valueChanges.subscribe(role => {
      const countryIdsControl = this.userForm.get('countryIds');
      if (role === UserRole.Admin) {
        countryIdsControl?.clearValidators();
        countryIdsControl?.setValue([]);
        countryIdsControl?.markAsUntouched();
      } else {
        countryIdsControl?.setValidators(Validators.required);
      }
      countryIdsControl?.updateValueAndValidity();
    });
  }

  private searchAzureUsers(term: string) {
    if (!term || term.length < 3) {
      this.azureUsers = [];
      this.showResults = false;
      return of(null);
    }

    this.isSearching = true;
    this.showResults = true;

    return this.userManagementService.searchAzureAdUsers(term, 10).pipe(
      catchError(error => {
        console.error('Error searching Azure users:', error);
        this.azureUsers = [];
        this.isSearching = false;
        return of(null);
      })
    ).pipe(
      switchMap(response => {
        if (response) {
          this.azureUsers = response.users;
        }
        this.isSearching = false;
        return of(response);
      })
    );
  }

  selectAzureUser(user: AzureAdUserDetailsDto): void {
    this.selectedAzureUser = user;
    this.searchControl.setValue(user.displayName, { emitEvent: false });
    this.showResults = false;
    this.azureUsers = [];
  }

  clearSelection(): void {
    this.selectedAzureUser = null;
    this.searchControl.setValue('');
    this.showResults = false;
    this.azureUsers = [];
    this.userForm.reset();
  }

  isRoleAdmin(): boolean {
    return this.userForm.get('role')?.value === UserRole.Admin;
  }

  canSave(): boolean {
    return this.selectedAzureUser !== null && this.userForm.valid && !this.isSaving;
  }

  save(): void {
    if (!this.canSave() || !this.selectedAzureUser) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const request: CreateInternalUserRequest = {
      email: this.selectedAzureUser.email,
      role: parseInt(this.userForm.value.role, 10) as UserRole,
      countryIds: this.userForm.value.countryIds || []
    };

    this.userManagementService.addInternalUser(request).subscribe({
      next: (response) => {
        console.log('User added successfully:', response);
        this.isSaving = false;
        this.userAdded.emit();
        this.close();
      },
      error: (error) => {
        console.error('Error adding user:', error);
        this.errorMessage = error.message || this.i18n.t('users.errors.add_failed');
        this.isSaving = false;
      }
    });
  }

  close(): void {
    this.modalClosed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.close();
    }
  }
}
