import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService, TenantAvailabilityState } from '../services/auth.service';
import { CompanyPopupComponent } from '../company-popup/company-popup.component';
import { OtpPopupComponent } from '../otp-popup/otp-popup.component';

const REMEMBER_EMAIL_KEY = 'safeflow_remember_email';

interface Company {
  id: string;
  name: string;
  tenancyName: string;
  location: string;
  initials: string;
}

@Component({
  selector: 'app-login-body',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    CompanyPopupComponent,
    OtpPopupComponent
  ],
  templateUrl: './login-body.component.html',
  styleUrl: './login-body.component.css'
})
export class LoginBodyComponent implements OnInit {

  // =========================================================
  // OTP VERIFICATION
  // =========================================================

  showOtpModal = false;
  pendingUserId: number | null = null;

  onOtpClose(): void {
    this.showOtpModal = false;
    this.pendingUserId = null;
  }

  onOtpVerified(): void {
    this.showOtpModal = false;
    this.isLoggingIn = false;
    this.router.navigate(['/dashboard']);
  }

  // =========================================================
  // LOGIN
  // =========================================================

  onLogin(): void {

    this.emailTouched = true;
    this.passwordTouched = true;
    this.companyTouched = true;

    this.formError = '';

    if (!this.isHostMode && !this.selectedCompany) {
      this.formError = 'Please select a company or continue as Host.';
      return;
    }

    if (!this.isEmailValid) {
      this.formError = 'Please enter a valid email address.';
      return;
    }

    if (!this.isPasswordValid) {
      this.formError = `Password must be at least ${this.minPasswordLength} characters.`;
      return;
    }

    if (this.rememberMe) {
      localStorage.setItem(REMEMBER_EMAIL_KEY, this.email.trim());
    } else {
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
    }

    this.isLoggingIn = true;

    this.authService.login(this.email.trim(), this.password, this.rememberMe).subscribe({

      next: (result) => {

        if (result.requiresTwoFactorVerification) {
          this.pendingUserId = result.userId;
          this.showOtpModal = true;
          return;
        }

        this.isLoggingIn = false;
        this.router.navigate(['/dashboard']);
      },

      error: (error: unknown) => {
        console.error('Login error:', error);
        this.isLoggingIn = false;
        this.formError = 'Login failed. Please check your credentials and try again.';
      }

    });
  }

  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;

  emailTouched = false;
  passwordTouched = false;
  companyTouched = false;

  formError = '';
  isLoggingIn = false;

  // =========================================================
  // COMPANY (backed entirely by AuthService.checkTenant)
  // =========================================================

  selectedCompany: Company | null = null;

  showCompanyModal = false;

  companySearch = '';
  companies: Company[] = [];

  isLoadingCompanies = false;

  companyError = '';

  // =========================================================
  // HOST
  // =========================================================

  isHostMode = false;
  hostCompanyName = '';

  private readonly emailPattern =
    /^[^\s@]+@[^.\s@]+(?:\.[^.\s@]+)+$/;

  private readonly minPasswordLength = 6;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.restoreRememberedEmail();
  }

  get isEmailValid(): boolean {
    return this.emailPattern.test(this.email.trim());
  }

  get isPasswordValid(): boolean {
    return this.password.trim().length >= this.minPasswordLength;
  }

  get isFormValid(): boolean {
    return (
      this.isEmailValid &&
      this.isPasswordValid &&
      (this.isHostMode || !!this.selectedCompany)
    );
  }

  onEmailBlur(): void {
    this.emailTouched = true;
  }

  onPasswordBlur(): void {
    this.passwordTouched = true;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  openCompanyModal(): void {

    this.companySearch = this.selectedCompany?.tenancyName ?? '';

    this.companies = [];
    this.companyError = '';
    this.isLoadingCompanies = false;

    this.showCompanyModal = true;
  }

  closeCompanyModal(): void {

    this.showCompanyModal = false;

    this.companyError = '';
    this.companies = [];
    this.isLoadingCompanies = false;
  }

  // =========================================================
  // SEARCH = single tenant lookup via checkTenant
  // (no list-search endpoint exists on the backend)
  // =========================================================

  searchCompany(): void {

    const search = this.companySearch.trim();

    this.companyError = '';
    this.companies = [];

    if (!search) {
      this.companyError = 'Please enter a company name.';
      return;
    }

    this.isLoadingCompanies = true;

    this.authService.checkTenant(search).subscribe({

      next: (result) => {

        this.isLoadingCompanies = false;

        if (result.state === TenantAvailabilityState.Available) {
          this.companies = [this.buildCompanyFromName(search)];
        } else {
          this.companies = [];
          this.companyError = result.state === TenantAvailabilityState.InActive
            ? 'This company account is inactive.'
            : 'Enter valid company';
        }
      },

      error: (error: unknown) => {
        console.error('Error searching company:', error);
        this.companies = [];
        this.isLoadingCompanies = false;
        this.companyError = 'Unable to search company. Please try again.';
      }

    });
  }

  selectCompany(company: Company): void {

    this.selectedCompany = company;

    this.companySearch = company.tenancyName;
    this.companies = [];
    this.companyError = '';

    this.isHostMode = false;
    this.hostCompanyName = '';

    this.companyTouched = false;
    this.formError = '';

    this.showCompanyModal = false;
  }

  onCompanyVerified(companyName: string): void {

    this.selectedCompany = this.buildCompanyFromName(companyName);

    this.isHostMode = false;
    this.hostCompanyName = '';

    this.companyTouched = false;
    this.formError = '';

    this.showCompanyModal = false;
  }

  private buildCompanyFromName(name: string): Company {

    return {
      id: name,
      name,
      tenancyName: name,
      location: '',
      initials: name
        .split(/\s+/)
        .filter(Boolean)
        .map(word => word.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase()
    };
  }

  continueAsHost(companyName: string): void {

  const trimmed = companyName.trim();

  if (!trimmed) {
    this.companyError = 'Please enter a company name.';
    return;
  }

  this.isLoadingCompanies = true;
  this.companyError = '';

  this.authService.checkTenant(trimmed).subscribe({

    next: (result) => {
      this.isLoadingCompanies = false;

      switch (result.state) {
        case TenantAvailabilityState.Available:
          this.isHostMode = true;
          this.hostCompanyName = trimmed;
          this.selectedCompany = null;
          this.companyTouched = false;
          this.formError = '';
          this.companyError = '';
          this.showCompanyModal = false;
          break;

        case TenantAvailabilityState.InActive:
          this.companyError = 'This company account is inactive.';
          break;

        case TenantAvailabilityState.NotFound:
          this.companyError = 'Enter valid company';
          break;
      }
    },

    error: (error: unknown) => {
      console.error('Tenant check failed:', error);
      this.isLoadingCompanies = false;
      this.companyError = 'Unable to verify company. Please try again.';
    }
  });
}

  private restoreRememberedEmail(): void {

    const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);

    if (savedEmail) {
      this.email = savedEmail;
      this.rememberMe = true;
    }
  }
}