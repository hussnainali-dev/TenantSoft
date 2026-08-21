import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Company } from '../models/company';

@Injectable({
  providedIn: 'root'
})
export class aService {

  private readonly apiUrl = '/api/companies';

  constructor(private http: HttpClient) {}

  getCompanies(search: string): Observable<Company[]> {

    const query = search.trim()
      ? `?search=${encodeURIComponent(search.trim())}`
      : '';

    return this.http.get<Company[]>(
      `${this.apiUrl}${query}`
    );
  }
}