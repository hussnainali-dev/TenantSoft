import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { User } from '../models/user';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.css'
})
export class CreateUserComponent {

  // =========================================================
  // FORM FIELDS
  // =========================================================

  name = '';
  surname = '';
  userName = '';
  emailAddress = '';
  phoneNumber = '';
  password = '';
  confirmPassword = '';
  userType = 0;
  isActive = true;

  showPassword = false;
  showConfirmPassword = false;

  nameTouched = false;
  surnameTouched = false;
  userNameTouched = false;
  emailTouched = false;
  phoneTouched = false;
  passwordTouched = false;
  confirmPasswordTouched = false;
  userTypeTouched = false;

  formError = '';
  isCreating = false;
  successMessage = '';

  readonly userTypes: string[] = ['Admin', 'Manager', 'Staff'];

  private readonly emailPattern =
    /^[^\s@]+@[^.\s@]+(?:\.[^.\s@]+)+$/;

  private readonly phonePattern =
    /^[0-9+\-\s]{7,15}$/;

  private readonly minPasswordLength = 6;

  constructor(
    private readonly userService: UserService
  ) {}

  // =========================================================
  // VALIDATION GETTERS
  // =========================================================

  get isNameValid(): boolean {
    return this.name.trim().length >= 2;
  }

  get isSurnameValid(): boolean {
    return this.surname.trim().length >= 2;
  }

  get isUserNameValid(): boolean {
    return this.userName.trim().length >= 3;
  }

  get isEmailValid(): boolean {
    return this.emailPattern.test(this.emailAddress.trim());
  }

  get isPhoneValid(): boolean {
    return this.phonePattern.test(this.phoneNumber.trim());
  }

  get isPasswordValid(): boolean {
    return this.password.length >= this.minPasswordLength;
  }

  get doPasswordsMatch(): boolean {
    return this.password === this.confirmPassword && this.confirmPassword.length > 0;
  }

  get isUserTypeValid(): boolean {
    return !!this.userType;
  }

  // =========================================================
  // BLUR HANDLERS
  // =========================================================

  onNameBlur(): void { this.nameTouched = true; }
  onSurnameBlur(): void { this.surnameTouched = true; }
  onUserNameBlur(): void { this.userNameTouched = true; }
  onEmailBlur(): void { this.emailTouched = true; }
  onPhoneBlur(): void { this.phoneTouched = true; }
  onPasswordBlur(): void { this.passwordTouched = true; }
  onConfirmPasswordBlur(): void { this.confirmPasswordTouched = true; }
  onUserTypeBlur(): void { this.userTypeTouched = true; }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // =========================================================
  // SUBMIT
  // =========================================================

  onCreateUser(): void {

    this.nameTouched = true;
    this.surnameTouched = true;
    this.userNameTouched = true;
    this.emailTouched = true;
    this.phoneTouched = true;
    this.passwordTouched = true;
    this.confirmPasswordTouched = true;
    this.userTypeTouched = true;

    this.formError = '';
    this.successMessage = '';

    if (!this.isNameValid) {
      this.formError = 'Please enter the user\'s name.';
      return;
    }

    if (!this.isSurnameValid) {
      this.formError = 'Please enter the user\'s surname.';
      return;
    }

    if (!this.isUserNameValid) {
      this.formError = 'Username must be at least 3 characters.';
      return;
    }

    if (!this.isEmailValid) {
      this.formError = 'Please enter a valid email address.';
      return;
    }

    if (!this.isPhoneValid) {
      this.formError = 'Please enter a valid phone number.';
      return;
    }

    if (!this.isPasswordValid) {
      this.formError = `Password must be at least ${this.minPasswordLength} characters.`;
      return;
    }

    if (!this.doPasswordsMatch) {
      this.formError = 'Passwords do not match.';
      return;
    }

    if (!this.isUserTypeValid) {
      this.formError = 'Please select a user type.';
      return;
    }

    this.isCreating = true;

    const payload: User = {
      name: this.name.trim(),
      surname: this.surname.trim(),
      userName: this.userName.trim(),
      emailAddress: this.emailAddress.trim(),
      phoneNumber: this.phoneNumber.trim(),
      password: this.password,
      userType: this.userType,
      isActive: this.isActive
    };

    this.userService.createUser(payload).subscribe({

      next: () => {
        this.isCreating = false;
        this.successMessage = `${this.name.trim()} has been created successfully.`;
        this.resetForm();
      },

      error: (error: unknown) => {
        console.error('Error creating user:', error);
        this.isCreating = false;
        this.formError = 'Unable to create user. Please try again.';
      }

    });
  }

  private resetForm(): void {

    this.name = '';
    this.surname = '';
    this.userName = '';
    this.emailAddress = '';
    this.phoneNumber = '';
    this.password = '';
    this.confirmPassword = '';
    this.userType = 0;
    this.isActive = true;

    this.nameTouched = false;
    this.surnameTouched = false;
    this.userNameTouched = false;
    this.emailTouched = false;
    this.phoneTouched = false;
    this.passwordTouched = false;
    this.confirmPasswordTouched = false;
    this.userTypeTouched = false;
  }
}