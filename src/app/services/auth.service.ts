import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';

// =========================================================
// TYPES
// =========================================================

export enum TenantAvailabilityState {
  Available = 1,
  InActive = 2,
  NotFound = 3
}

export interface IsTenantAvailableOutput {
  state: TenantAvailabilityState;
  tenantId?: number;
}

export interface AuthenticateResult {
  accessToken?: string;
  encryptedAccessToken?: string;
  expireInSeconds?: number;
  userId: number;
  requiresTwoFactorVerification?: boolean;
}

export interface VerifyOtpResult {
  accessToken: string;
  encryptedAccessToken: string;
  expireInSeconds: number;
  userId: number;
}

interface AbpWrappedResponse<T> {
  result: T;
  success: boolean;
  error: { message?: string; details?: string } | null;
}

const TENANT_ID_KEY = 'safeflow_tenant_id';
const TENANCY_NAME_KEY = 'safeflow_tenancy_name';
const ACCESS_TOKEN_KEY = 'safeflow_access_token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // =========================================================
  // TENANT CHECK
  // Endpoint: POST /api/services/app/Account/IsTenantAvailable
  // =========================================================

  checkTenant(tenancyName: string): Observable<IsTenantAvailableOutput> {

    const url = `${this.baseUrl}/api/services/app/Account/IsTenantAvailable`;

    return this.http
      .post<AbpWrappedResponse<IsTenantAvailableOutput>>(
        url,
        { tenancyName: tenancyName.trim() }
      )
      .pipe(
        map(res => res.result),
        tap(result => {
          if (result.state === TenantAvailabilityState.Available && result.tenantId) {
            this.setTenant(result.tenantId, tenancyName.trim());
          } else {
            this.clearTenant();
          }
        })
      );
  }

  // =========================================================
  // STEP 1: LOGIN (password check)
  // Endpoint: POST /api/TokenAuth/Authenticate
  // Tenant is resolved via Abp.TenantId header, NOT body field
  // =========================================================

  login(usernameOrEmail: string, password: string, rememberClient = false): Observable<AuthenticateResult> {

    const url = `${this.baseUrl}/api/TokenAuth/Authenticate`;
    const headers = this.buildTenantHeaders();

    return this.http
      .post<AbpWrappedResponse<AuthenticateResult>>(
        url,
        {
          userNameOrEmailAddress: usernameOrEmail,
          password,
          rememberClient
        },
        { headers }
      )
      .pipe(
        map(res => res.result),
        tap(result => {
          if (result.accessToken) {
            this.setAccessToken(result.accessToken);
          }
        })
      );
  }

  // =========================================================
  // STEP 2: SEND OTP (triggers the code after password succeeds)
  // Endpoint: POST /api/TokenAuth/TwoFactorAuthentication
  // =========================================================

  sendTwoFactorCode(userId: number, provider = 'Email'): Observable<void> {

    const url = `${this.baseUrl}/api/TokenAuth/TwoFactorAuthentication`;
    const headers = this.buildTenantHeaders();

    return this.http
      .post<AbpWrappedResponse<void>>(url, { userId, provider }, { headers })
      .pipe(map(res => res.result));
  }

  // =========================================================
  // RESEND OTP
  // Endpoint: POST /api/TokenAuth/ResendOtp
  // =========================================================

  resendOtp(userId: number, provider = 'Email'): Observable<void> {

    const url = `${this.baseUrl}/api/TokenAuth/ResendOtp`;
    const headers = this.buildTenantHeaders();

    return this.http
      .post<AbpWrappedResponse<void>>(url, { userId, provider }, { headers })
      .pipe(map(res => res.result));
  }

  // =========================================================
  // STEP 3: VERIFY OTP (returns the real access token)
  // Endpoint: POST /api/TokenAuth/VerifyOtp
  // =========================================================

  verifyOtp(userId: number, code: string, provider = 'Email'): Observable<VerifyOtpResult> {

    const url = `${this.baseUrl}/api/TokenAuth/VerifyOtp`;
    const headers = this.buildTenantHeaders();

    return this.http
      .post<AbpWrappedResponse<VerifyOtpResult>>(
        url,
        { userId, otpCode: code, provider },
        { headers }
      )
      .pipe(
        map(res => res.result),
        tap(result => this.setAccessToken(result.accessToken))
      );
  }

  // =========================================================
  // LOGOUT
  // =========================================================

  logout(): void {
    this.clearAccessToken();
    this.clearTenant();
  }

  // =========================================================
  // TENANT-AWARE HEADERS
  // =========================================================

  private buildTenantHeaders(): HttpHeaders {
    const tenantId = this.getTenantId();
    return tenantId
      ? new HttpHeaders({ 'Abp.TenantId': String(tenantId) })
      : new HttpHeaders();
  }

  // =========================================================
  // STORAGE HELPERS
  // =========================================================

  setTenant(tenantId: number, tenancyName: string): void {
    localStorage.setItem(TENANT_ID_KEY, String(tenantId));
    localStorage.setItem(TENANCY_NAME_KEY, tenancyName);
  }

  getTenantId(): number | null {
    const value = localStorage.getItem(TENANT_ID_KEY);
    return value ? Number(value) : null;
  }

  getTenancyName(): string | null {
    return localStorage.getItem(TENANCY_NAME_KEY);
  }

  clearTenant(): void {
    localStorage.removeItem(TENANT_ID_KEY);
    localStorage.removeItem(TENANCY_NAME_KEY);
  }

  setAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  clearAccessToken(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }
}