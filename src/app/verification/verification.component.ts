import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [],
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.css'
})
export class VerificationComponent {

  @Input() companyName = '';

  @Output() verificationSuccess =
    new EventEmitter<string>();

  @Output() verificationFailed =
    new EventEmitter<string>();

  isVerifying = false;
  errorMessage = '';

  private readonly validCompanies = [
    'PamexSoft',
    'WebSoft',
    'CloudyAir'
  ];

  verifyCompany(): void {

    const name = this.companyName.trim();

    // Empty company name
    if (!name) {

      this.errorMessage =
        'Please enter a company name.';

      this.verificationFailed.emit(
        this.errorMessage
      );

      return;
    }

    // Start verification
    this.isVerifying = true;
    this.errorMessage = '';

    setTimeout(() => {

      const matchedCompany =
        this.validCompanies.find(
          company =>
            company.toLowerCase() ===
            name.toLowerCase()
        );

      // Invalid company
      if (!matchedCompany) {

        this.isVerifying = false;

        this.errorMessage =
          'Invalid company name.';

        this.verificationFailed.emit(
          this.errorMessage
        );

        return;
      }

      // Valid company
      this.isVerifying = false;

      this.verificationSuccess.emit(
        matchedCompany
      );

    }, 1000);
  }
}