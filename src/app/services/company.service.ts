// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';

// // ABP's standard response shape for this endpoint
// export enum TenantAvailabilityState {
//   Available = 1,
//   InActive = 2,
//   NotFound = 3
// }

// export interface IsTenantAvailableOutput {
//   state: TenantAvailabilityState;
//   tenantId?: number;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class TenantService {

//   // Full absolute URL since this is a different host than your default apiUrl
//   private readonly apiUrl =
//     'https://ubairtradersapi-h9adbdcycjb3edas.uaenorth-01.azurewebsites.net/api/services/app/Account/IsTenantAvailable';

//   constructor(private http: HttpClient) {}

//   isTenantAvailable(tenancyName: string): Observable<IsTenantAvailableOutput> {
//     const query = `?tenancyName=${encodeURIComponent(tenancyName.trim())}`;

//     return this.http.get<IsTenantAvailableOutput>(
//       `${this.apiUrl}${query}`
//     );
//   }
// }