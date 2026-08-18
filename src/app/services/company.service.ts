import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

import { Company } from '../models/company';

/**
 * Handles fetching the list of companies a user can log in to.
 *
 * NOTE: This service requires HttpClient to be provided at the app level, e.g.
 * in app.config.ts:
 *   providers: [provideHttpClient()]
 */
@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  private readonly apiUrl = '/api/companies';

  constructor(private http: HttpClient) {}

 
  getCompanies(search: string = ''): Observable<Company[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';

    return this.http.get<Company[]>(`${this.apiUrl}${query}`).pipe(
      catchError(() => of(this.getMockCompanies(search)))
    );
  }

  private getMockCompanies(search: string): Company[] {
    const mockCompanies: Company[] = [
      { id: '1', name: 'Green Valley Foods',  location: 'Manchester, UK', initials: 'GV' },
      { id: '2', name: 'Fresh Harvest Ltd',   location: 'Leeds, UK',      initials: 'FH' },
      { id: '3', name: 'Coastal Kitchens',    location: 'Brighton, UK',   initials: 'CK' },
      { id: '4', name: 'Urban Bites Group',   location: 'London, UK',    initials: 'UB' },
      { id: '5', name: 'Golden Fields Co.',   location: 'Bristol, UK',   initials: 'GF' },
      { id: '6', name: 'Harborside Catering', location: 'Liverpool, UK', initials: 'HC' }
    ];

    if (!search.trim()) {
      return mockCompanies;
    }

    const term = search.trim().toLowerCase();

    return mockCompanies.filter(company =>
      company.name.toLowerCase().includes(term) ||
      company.location.toLowerCase().includes(term)
    );
  }
}