import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  // MOCK ONLY: the code we "sent". In a real app this lives
  // server-side and is never exposed to the client.
  private generatedCode = '';

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
  // SEND CODE (MOCK)
  // =========================================================

  private sendCode(): void {

    this.generatedCode = this.generateCode();

    // MOCK ONLY: replace with a real API call, e.g.
    // this.otpService.sendCode(this.email).subscribe(...)
    console.log(
      `Verification code sent to ${this.email}:`,
      this.generatedCode
    );
  }

  private generateCode(): string {

    return Math.floor(
      100000 + Math.random() * 900000
    ).toString();
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

    if (this.isVerifying) {
      return;
    }

    this.errorMessage = '';

    if (!this.isCodeValid) {

      this.errorMessage =
        `Enter the ${this.codeLength}-digit code.`;

      return;
    }

    this.isVerifying = true;

    setTimeout(() => {

      this.isVerifying = false;

      if (this.code.trim() === this.generatedCode) {
        this.verified.emit();
        return;
      }

      this.errorMessage = 'Invalid or expired code.';

    }, 800);
  }

  // =========================================================
  // RESEND CODE
  // =========================================================

  resendCode(): void {

    if (this.isResending || this.isVerifying) {
      return;
    }

    this.isResending = true;
    this.errorMessage = '';
    this.resendMessage = '';

    setTimeout(() => {

      this.sendCode();

      this.isResending = false;
      this.code = '';
      this.resendMessage = 'A new code has been sent.';

    }, 600);
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