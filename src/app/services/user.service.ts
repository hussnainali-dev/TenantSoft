import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../environments/environment';
import { User } from '../models/user';

interface AbpResponse<T> {
  result: T;
  targetUrl: string | null;
  success: boolean;
  error: {
    message: string;
    details: string;
  } | null;
  unAuthorizedRequest: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly createUserUrl =
    `${environment.apiUrl}/api/services/app/User/Create`;

  constructor(private readonly http: HttpClient) {}

  createUser(payload: User): Observable<User> {

    return this.http.post<AbpResponse<User> | User>(
      this.createUserUrl,
      payload
      // TODO: once confirmed, add auth here, e.g.:
      // { headers: { Authorization: `Bearer ${token}` } }
    ).pipe(
      map((response) => {

        // ABP-style envelope: { result: {...}, success: true, ... }
        if (response && typeof response === 'object' && 'result' in response) {
          return (response as AbpResponse<User>).result;
        }

        // Raw object response
        return response as User;
      })
    );
  }
}