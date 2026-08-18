import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { Company } from '../models/company';
import { CompanyService } from '../services/company.service';

const REMEMBER_EMAIL_KEY = 'safeflow_remember_email';

@Component({
  selector: 'app-login-body',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login-body.component.html',
  styleUrl: './login-body.component.css'
})
export class LoginBodyComponent implements OnInit, OnDestroy {

  // ----- Form fields -----
  
  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;

  // ----- Validation / touched state -----
  emailTouched = false;
  passwordTouched = false;
  companyTouched = false;
  formError = '';

  // ----- Login flow state -----
  isLoggingIn = false;

  // ----- Company selection state -----
  selectedCompany: Company | null = null;
  showCompanyModal = false;
  companySearch = '';
  companies: Company[] = [];
  isLoadingCompanies = false;
  companyError = '';

  private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly minPasswordLength = 6;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private companyService: CompanyService) {}

  ngOnInit(): void {
    this.restoreRememberedEmail();
    this.loadCompanies();

    // Debounce company search so we don't hammer the API on every keystroke.
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(term => this.loadCompanies(term));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =========================================
  // Company loading & search
  // =========================================

  loadCompanies(search: string = ''): void {
    this.isLoadingCompanies = true;
    this.companyError = '';

    this.companyService.getCompanies(search).subscribe({
      next: (companies) => {
        this.companies = companies;
        this.isLoadingCompanies = false;
      },
      error: (error) => {
        console.error('Error loading companies:', error);
        this.companyError = 'Unable to load companies. Please try again.';
        this.isLoadingCompanies = false;
      }
    });
  }

  /** Client-side safety net on top of the server-side filtered results. */
  get filteredCompanies(): Company[] {
    const search = this.companySearch.trim().toLowerCase();

    if (!search) {
      return this.companies;
    }

    return this.companies.filter(company =>
      company.name.toLowerCase().includes(search) ||
      company.location.toLowerCase().includes(search)
    );
  }

  onCompanySearchChange(term: string): void {
  this.companySearch = term;
}

  // =========================================
  // Validation
  // =========================================

  get isEmailValid(): boolean {
    return this.emailPattern.test(this.email.trim());
  }

  get isPasswordValid(): boolean {
    return this.password.trim().length >= this.minPasswordLength;
  }

  get isFormValid(): boolean {
    return this.isEmailValid && this.isPasswordValid && !!this.selectedCompany;
  }

  onEmailBlur(): void {
    this.emailTouched = true;
  }

  onPasswordBlur(): void {
    this.passwordTouched = true;
  }

  // =========================================
  // Login
  // =========================================

  onLogin(): void {
    this.emailTouched = true;
    this.passwordTouched = true;
    this.companyTouched = true;
    this.formError = '';

    if (!this.selectedCompany) {
      this.formError = 'Please select a company to continue.';
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

    this.isLoggingIn = true;

    if (this.rememberMe) {
      localStorage.setItem(REMEMBER_EMAIL_KEY, this.email.trim());
    } else {
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
    }

    // Replace this simulated delay with your real AuthService call, e.g.:
    // this.authService.login({ ...payload }).subscribe({ next, error })
    setTimeout(() => {
      this.isLoggingIn = false;

      console.log('Login submitted:', {
        companyId: this.selectedCompany?.id,
        companyName: this.selectedCompany?.name,
        email: this.email.trim(),
        rememberMe: this.rememberMe
      });
    }, 900);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private restoreRememberedEmail(): void {
    const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);

    if (savedEmail) {
      this.email = savedEmail;
      this.rememberMe = true;
    }
  }

  // =========================================
  // Company modal
  // =========================================

  openCompanyModal(): void {
    this.companySearch = '';
    this.showCompanyModal = true;
    this.loadCompanies();
  }

  closeCompanyModal(): void {
    this.showCompanyModal = false;
  }

  selectCompany(company: Company): void {
    this.selectedCompany = company;
    this.companyTouched = false;
    this.formError = '';
    this.closeCompanyModal();
  }

  continueAsHost(): void {
    this.selectedCompany = null;
    this.closeCompanyModal();
  }

  onModalBackgroundClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeCompanyModal();
    }
  }
}