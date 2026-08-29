import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService, TenantAvailabilityState } from '../services/auth.service';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [],
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.css'
})
export class VerificationComponent {

  @Input() companyName = '';

  @Output() verificationSuccess = new EventEmitter<string>();
  @Output() verificationFailed = new EventEmitter<string>();

  isVerifying = false;
  errorMessage = '';

  constructor(private readonly authService: AuthService) {}

  verifyCompany(): void {

    const name = this.companyName.trim();

    if (!name) {
      this.errorMessage = 'Please enter a company name.';
      this.verificationFailed.emit(this.errorMessage);
      return;
    }

    this.isVerifying = true;
    this.errorMessage = '';

    this.authService.checkTenant(name).subscribe({

      next: (result) => {
        this.isVerifying = false;

        switch (result.state) {

          case TenantAvailabilityState.Available:
            this.verificationSuccess.emit(name);
            break;

          case TenantAvailabilityState.InActive:
            this.errorMessage = 'This company account is inactive.';
            this.verificationFailed.emit(this.errorMessage);
            break;

          case TenantAvailabilityState.NotFound:
            this.errorMessage = 'Invalid company name.';
            this.verificationFailed.emit(this.errorMessage);
            break;
        }
      },

      error: (error: unknown) => {
        console.error('Tenant verification failed:', error);
        this.isVerifying = false;
        this.errorMessage = 'Unable to verify company. Please try again.';
        this.verificationFailed.emit(this.errorMessage);
      }
    });
  }
}