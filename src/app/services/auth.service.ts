import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import {
  PublicClientApplication,
  AuthenticationResult,
  RedirectRequest,
  SilentRequest,
  AccountInfo
} from '@azure/msal-browser';
import { MSAL_INSTANCE } from '@azure/msal-angular';
import { User, LoginRequest, AuthResponse } from '../models/user.model';
import { environment } from '../../environments/environment';
import { AppConstants } from '../core/constants/app-constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private initialized = false;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  public customUserId: string | null = null;

  constructor(
    private http: HttpClient,
    @Inject(MSAL_INSTANCE) private msalInstance: PublicClientApplication
  ) {
    this.initializeMsal();
    this.loadUserFromStorage();
  }

  /**setActiveAccount
   * Initialise MSAL et traite la réponse de redirection si elle existe.
   */
  private async initializeMsal(): Promise<void> {
    if (this.initialized) return;

    await this.msalInstance.initialize();
    this.initialized = true;
    console.log('✅ MSAL initialisé');

    const response = await this.msalInstance.handleRedirectPromise();
    if (response) {
      console.log('🔄 Réponse de redirection reçue');
      await this.handleAuthenticationResult(response);
      window.location.replace('/client/home');
    } else {
      const accounts = this.msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        this.msalInstance.setActiveAccount(accounts[0]);
        console.log('✅ Active account restored for MSAL interceptor:', accounts[0].username);
      }
    }
  }

  /**
   * Permet à Angular d'attendre l'init si nécessaire (APP_INITIALIZER)
   */
  waitForInit(): Promise<void> {
    return this.initializeMsal();
  }

  /**
   * Lance la connexion Azure AD
   */
  async loginWithAzureAD(): Promise<void> {
    // s'assure que l'instance est prête
    if (!this.initialized) {
      await this.initializeMsal();
    }

    const loginRequest: RedirectRequest = {
      scopes: ['openid', 'profile', 'email', environment.azureAd.backendScope],
      prompt: 'select_account'
    };

    return this.msalInstance.loginRedirect(loginRequest);
  }

  /**
   * Connexion classique avec email/password (pour simulation)
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    // Simulation pour le développement - remplacer par l'appel réel à votre API
    return this.simulateLogin(credentials).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('isAuthenticated', 'true');
        this.currentUserSubject.next(response.user);
        console.log('✅ Simulation login successful:', response.user);
      }),
      catchError(error => {
        console.error('Erreur de connexion:', error);
        throw error;
      })
    );
  }

  /**
   * Simulation de connexion pour le développement
   */
  private simulateLogin(credentials: LoginRequest): Observable<AuthResponse> {
    // Simulation - remplacer par: return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials);
    return of({
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: '1',
        email: credentials.email,
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Company',
        phone: '+33123456789',
        role: credentials.email.includes('admin') ? 'admin' : 'external',
        appRoles: credentials.email.includes('admin') ? ['admin'] : ['external'],
        status: 'approved',
        registrationDate: new Date(),
        approvalDate: new Date()
      },
      expiresIn: 3600
    });
  }

  /**
   * Traite le résultat d'authentification et sauvegarde l'utilisateur
   */
  private async handleAuthenticationResult(result: AuthenticationResult): Promise<void> {
    const account = result.account;
    if (!account) throw new Error('No account information');

    this.msalInstance.setActiveAccount(account);
    console.log('✅ Active account set for MSAL interceptor:', account.username);

    const roles = this.extractRolesFromToken(result.accessToken);
    const userRole = this.determineUserRole(roles, account.username);

    const user: User = {
      id: account.homeAccountId,
      email: account.username,
      firstName: account.name?.split(' ')[0] ?? 'Utilisateur',
      lastName: account.name?.split(' ').slice(1).join(' ') ?? '',
      company: 'N/A',
      phone: '',
      role: userRole,
      appRoles:roles,
      status: 'approved',
      registrationDate: new Date(),
      approvalDate: new Date(),
      azureAdId: account.localAccountId
    };

    localStorage.setItem('token', result.accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');
    this.currentUserSubject.next(user);
  }

  /**
   * Extrait les rôles depuis le token JWT Azure AD
   */
  private extractRolesFromToken(accessToken: string): string[] {
    try {
      // Décoder le token JWT (partie payload)
      const tokenParts = accessToken.split('.');
      if (tokenParts.length !== 3) {
        console.warn('⚠️ Token JWT invalide');
        return [];
      }

      // Décoder la partie payload (base64url)
      const payload = JSON.parse(atob(tokenParts[1].replace(/-/g, '+').replace(/_/g, '/')));
      console.log('🔍 Token payload:', payload);

      // Extraire les rôles selon les claims Azure AD
      const roles: string[] = [];
      
      // Rôles d'application (app roles)
      if (payload.roles && Array.isArray(payload.roles)) {
        roles.push(...payload.roles);
      }
      
      // Groupes Azure AD
      if (payload.groups && Array.isArray(payload.groups)) {
        roles.push(...payload.groups);
      }
      
      // Claims personnalisés pour les rôles
      if (payload['extension_UserRole']) {
        roles.push(payload['extension_UserRole']);
      }
      
      // Rôles dans les claims wids (Well-known IDs)
      if (payload.wids && Array.isArray(payload.wids)) {
        roles.push(...payload.wids);
      }

      console.log('🎭 Rôles extraits du token:', roles);
      return roles;
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction des rôles:', error);
      return [];
    }
  }

  /**
   * Détermine le rôle utilisateur basé sur les rôles Azure AD
   */
  private determineUserRole(azureRoles: string[], email: string): string {
    let userRole='';
    // Rôles d'administration connus
    const internalRoles = AppConstants.AdRoleList.InternalRoles;
    

    const externalRoles =AppConstants.AdRoleList.ExternalRoles;
    
    // Groupes d'administration connus (remplacer par vos GUIDs réels)
    const adminGroups = AppConstants.AdGroupList.InternalGroups
    
    // Vérifier si l'utilisateur a un rôle admin
    const hasExternalRole = azureRoles.some(role => 
      externalRoles.includes(role)
    );

    // Vérifier si l'utilisateur a un rôle admin
    const hasAdminRole = azureRoles.some(role => 
      internalRoles.includes(role) || adminGroups.includes(role)
    );

    // Vérifier par domaine email (fallback)
    const isAfdbEmail = email.toLowerCase().includes('@afdb.org') || 
                       email.toLowerCase().includes('@afdb.com');

    if (hasAdminRole || isAfdbEmail) {
      console.log('✅ Utilisateur identifié comme admin/interne');
      userRole= AppConstants.GeneralUserRole.Internal;
    }

    if(hasExternalRole){
      userRole= AppConstants.GeneralUserRole.External;
    }

    return userRole;
  }

  /**
   * Obtient les rôles de l'utilisateur actuel
   */
  getCurrentUserRoles(): string[] {
    const token = this.getToken();
    if (!token) return [];
    
    return this.extractRolesFromToken(token);
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  hasRole(roleName: string): boolean {
    const roles = this.getCurrentUserRoles();
    console.log('current user roles', roles)
    return roles.includes(roleName);
  }

  /**
   * Vérifie si l'utilisateur appartient à un groupe spécifique
   */
  hasGroup(groupId: string): boolean {
    return this.hasRole(groupId);
  }

  /**
   * Recharge l'utilisateur depuis le localStorage
   */
  private loadUserFromStorage(): void {
    const userData = localStorage.getItem('user');
    const isAuth = localStorage.getItem('isAuthenticated');
    if (userData && isAuth === 'true') {
      try {
        const user: User = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('Erreur parsing user', e);
        this.clearAuthData();
      }
    }
  }

  /**
   * Déconnexion complète
   */
  async logout(): Promise<void> {
    this.clearAuthData();
    const accounts = this.msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      await this.msalInstance.logoutRedirect({ account: accounts[0] });
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!(localStorage.getItem('token') &&
              localStorage.getItem('isAuthenticated') === 'true' &&
              this.currentUserSubject.value);
  }

  isAdmin(): boolean {

    return this.hasRole(AppConstants.AdRoleName.Admin)
  }

  isInternalUser(): boolean {
    return this.currentUserSubject.value?.role===AppConstants.GeneralUserRole.Internal;
  }

  isExternalUser(): boolean {
    return this.currentUserSubject.value?.role===AppConstants.GeneralUserRole.External;

    //return this.hasRole(AppConstants.AdRoleName.ExternalUser)
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserEmail(): string | null {
    const user = this.getCurrentUser();
    return user ? user.email : null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  async getAccessToken(): Promise<string | null> {
    const account = this.msalInstance.getActiveAccount();
    if (!account) {
      console.warn('Aucun compte actif dans MSAL');
      return null;
    }

    const request = {
      account,
      scopes: [environment.azureAd.backendScope]
    };

    try {
      const result = await this.msalInstance.acquireTokenSilent(request);

      if (!this.customUserId && account.username) {
        await this.fetchAndSetCustomUserId(account.username);
      }

      return result.accessToken;
    } catch (error) {
      console.error('❌ Erreur lors du refresh du token:', error);
      return null;
    }
  }

  private async fetchAndSetCustomUserId(email: string): Promise<void> {
    try {
      const response = await this.http.get<any>(`${environment.apiUrl}/Users/me/${email}`).toPromise();
      if (response?.user?.id) {
        this.customUserId = response.user.id;
        console.log('✅ Custom User ID set:', this.customUserId);
      }
    } catch (error) {
      console.error('❌ Error fetching user ID:', error);
    }
  }

  getCustomUserId(): string | null {
    return this.customUserId;
  }
}

