import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VerificationComponent } from '../verification/verification.component';

@Component({
  selector: 'app-company-popup',
  standalone: true,
  imports: [FormsModule, VerificationComponent],
  templateUrl: './company-popup.component.html',
  styleUrl: './company-popup.component.css'
})
export class CompanyPopupComponent {

  // =========================================================
  // INPUTS FROM LOGIN BODY
  // =========================================================

  @Input() show = false;

  @Input() companySearch = '';

  @Input() hostError = '';

  // =========================================================
  // EVENTS TO LOGIN BODY
  // =========================================================

  @Output() close = new EventEmitter<void>();

  // Emits the verified company name once VerificationComponent
  // confirms it. login-body builds the Company object from this.
  @Output() companyVerified = new EventEmitter<string>();

  @Output() continueAsHost =
    new EventEmitter<string>();

  // =========================================================
  // EMBEDDED VERIFICATION COMPONENT
  // =========================================================

  @ViewChild(VerificationComponent)
  private verificationRef!: VerificationComponent;

  get isVerifying(): boolean {
    return this.verificationRef?.isVerifying ?? false;
  }

  // =========================================================
  // CLOSE POPUP
  // =========================================================

  onClose(): void {

    if (this.isVerifying) {
      return;
    }

    this.close.emit();
  }

  // =========================================================
  // SAVE (TRIGGERS VERIFICATION)
  // =========================================================

  onSave(): void {

    if (this.isVerifying) {
      return;
    }

    this.verificationRef.verifyCompany();
  }

  // =========================================================
  // VERIFICATION RESULT HANDLERS
  // =========================================================

  onVerificationSuccess(companyName: string): void {
    this.companyVerified.emit(companyName);
  }

  onVerificationFailed(_errorMessage: string): void {
    // VerificationComponent already displays its own error
    // message in its template, so there's nothing extra to do
    // here. Handler kept for clarity / future use.
  }

  // =========================================================
  // CONTINUE AS HOST
  // =========================================================

  onContinueAsHost(): void {

    if (this.isVerifying) {
      return;
    }

   this.continueAsHost.emit(this.companySearch.trim());
  }

  // =========================================================
  // BACKGROUND CLICK
  // =========================================================

  onBackgroundClick(
    event: MouseEvent
  ): void {

    if (this.isVerifying) {
      return;
    }

    if (
      event.target ===
      event.currentTarget
    ) {
      this.onClose();
    }
  }
}