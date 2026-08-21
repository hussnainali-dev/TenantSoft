import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Company } from '../models/company';
import { CompanyService } from '../services/company.service';
import { CompanyPopupComponent } from '../company-popup/company-popup.component';
import { OtpPopupComponent } from '../otp-popup/otp-popup.component';

const REMEMBER_EMAIL_KEY = 'safeflow_remember_email';

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
  // OTP VERIFICATION (delegated to app-otp-popup)
  // =========================================================

  showOtpModal = false;

  onOtpClose(): void {
    this.showOtpModal = false;
  }

  onOtpVerified(): void {
    this.showOtpModal = false;
    this.completeLogin();
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

    // -------------------------------------------------------
    // OPEN OTP VERIFICATION (login completes once verified)
    // -------------------------------------------------------

    this.showOtpModal = true;
  }

  // =========================================================
  // COMPLETE LOGIN (runs after OTP is verified)
  // =========================================================

  private completeLogin(): void {

    this.isLoggingIn = true;

    if (this.rememberMe) {
      localStorage.setItem(REMEMBER_EMAIL_KEY, this.email.trim());
    } else {
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
    }

    setTimeout(() => {

      this.isLoggingIn = false;

      console.log('Login submitted:', {
        companyId: this.selectedCompany?.id ?? null,
        companyName: this.selectedCompany?.name ?? this.hostCompanyName,
        isHostMode: this.isHostMode,
        email: this.email.trim(),
        rememberMe: this.rememberMe
      });

    }, 900);
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
  // COMPANY
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

  private readonly localCompanies: string[] = [
    'PamexSoft',
    'WebSoft',
    'CloudyAir'
  ];

  private readonly emailPattern =
    /^[^\s@]+@[^.\s@]+(?:\.[^.\s@]+)+$/;

  private readonly minPasswordLength = 6;

  constructor(
    @Inject(CompanyService) private readonly companyService: CompanyService,
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

    if (this.selectedCompany) {
      this.companySearch = this.selectedCompany.name;
    } else {
      this.companySearch = '';
    }

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

  searchCompany(): void {

    const search = this.companySearch.trim();

    this.companyError = '';
    this.companies = [];

    if (!search) {
      this.companyError = 'Please enter a company name.';
      return;
    }

    this.isLoadingCompanies = true;

    this.companyService.getCompanies(search).subscribe({

      next: (companies: Company[]) => {

        this.companies = companies;
        this.isLoadingCompanies = false;

        if (companies.length === 0) {
          this.companyError = 'Enter valid company';
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

    this.companySearch = company.name;

    this.companies = [];
    this.companyError = '';
  }

  onCompanyVerified(companyName: string): void {

    this.selectedCompany = this.buildCompanyFromName(companyName);

    this.isHostMode = false;
    this.hostCompanyName = '';

    this.companyTouched = false;
    this.formError = '';

    this.showCompanyModal = false;

    console.log('Company verification successful:', companyName);
  }

  private buildCompanyFromName(name: string): Company {

    return {
      id: name,
      name,
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

  continueAsHost(): void {

    const companyName = this.companySearch.trim();

    if (!companyName) {
      this.companyError = 'Please enter a company name.';
      return;
    }

    const matchedCompany = this.localCompanies.find(
      company => company.toLowerCase() === companyName.toLowerCase()
    );

    if (!matchedCompany) {
      this.companyError = 'Enter valid company';
      return;
    }

    this.isHostMode = true;
    this.hostCompanyName = matchedCompany;
    this.selectedCompany = null;

    this.companyTouched = false;
    this.formError = '';
    this.companyError = '';

    this.showCompanyModal = false;

    console.log('Continue as Host:', matchedCompany);
  }

  private restoreRememberedEmail(): void {

    const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);

    if (savedEmail) {
      this.email = savedEmail;
      this.rememberMe = true;
    }
  }
}