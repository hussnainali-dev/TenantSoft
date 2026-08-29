import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-otp-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './otp-popup.component.html',
  styleUrls: ['./otp-popup.component.css']
})
export class OtpPopupComponent implements OnChanges {

  // =========================================================
  // INPUTS FROM LOGIN BODY
  // =========================================================

  @Input() show = false;
  @Input() email = '';
  @Input() userId: number | null = null;

  // =========================================================
  // EVENTS TO LOGIN BODY
  // =========================================================

  @Output() close = new EventEmitter<void>();
  @Output() verified = new EventEmitter<void>();

  // =========================================================
  // OTP STATE
  // =========================================================

  code = '';

  isVerifying = false;
  errorMessage = '';

  isResending = false;
  resendMessage = '';

  private readonly codeLength = 6;

  constructor(private readonly authService: AuthService) {}

  // =========================================================
  // LIFECYCLE
  // =========================================================

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['show'] && this.show) {
      this.resetState();
      this.sendCode();
    }
  }

  // =========================================================
  // RESET STATE
  // =========================================================

  private resetState(): void {

    this.code = '';
    this.isVerifying = false;
    this.errorMessage = '';
    this.isResending = false;
    this.resendMessage = '';
  }

  // =========================================================
  // SEND CODE
  // =========================================================

  private sendCode(): void {

    if (!this.userId) {
      this.errorMessage = 'Missing user reference. Please try logging in again.';
      return;
    }

    this.authService.sendTwoFactorCode(this.userId).subscribe({
      next: () => {
        console.log(`Verification code sent to ${this.email}`);
      },
      error: (error: unknown) => {
        console.error('Failed to send OTP:', error);
        this.errorMessage = 'Unable to send verification code. Please try again.';
      }
    });
  }

  // =========================================================
  // VALIDATION
  // =========================================================

  get isCodeValid(): boolean {
    return /^\d{6}$/.test(this.code.trim());
  }

  // =========================================================
  // VERIFY CODE
  // =========================================================

  verifyCode(): void {

    if (this.isVerifying || !this.userId) {
      return;
    }

    this.errorMessage = '';

    if (!this.isCodeValid) {
      this.errorMessage = `Enter the ${this.codeLength}-digit code.`;
      return;
    }

    this.isVerifying = true;

    this.authService.verifyOtp(this.userId, this.code.trim()).subscribe({

      next: () => {
        this.isVerifying = false;
        this.verified.emit();
      },

      error: (error: unknown) => {
        console.error('OTP verification failed:', error);
        this.isVerifying = false;
        this.errorMessage = 'Invalid or expired code.';
      }

    });
  }

  // =========================================================
  // RESEND CODE
  // =========================================================

  resendCode(): void {

    if (this.isResending || this.isVerifying || !this.userId) {
      return;
    }

    this.isResending = true;
    this.errorMessage = '';
    this.resendMessage = '';

    this.authService.resendOtp(this.userId).subscribe({

      next: () => {
        this.isResending = false;
        this.code = '';
        this.resendMessage = 'A new code has been sent.';
      },

      error: (error: unknown) => {
        console.error('Resend OTP failed:', error);
        this.isResending = false;
        this.errorMessage = 'Unable to resend code. Please try again.';
      }

    });
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
  // BACKGROUND CLICK
  // =========================================================

  onBackgroundClick(event: MouseEvent): void {

    if (this.isVerifying) {
      return;
    }

    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}