import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ComparisonData, CsvRow } from '../models/csv.model';

@Injectable({
  providedIn: 'root'
})
export class CsvService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  compareFiles(baseFile: File, updatedFile: File): Observable<ComparisonData> {
    const formData = new FormData();
    formData.append('baseFile', baseFile);
    formData.append('updatedFile', updatedFile);
    return this.http.post<ComparisonData>(`${this.apiUrl}/compare`, formData);
  }

  approveRows(rows: CsvRow[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/approve`, { rows });
  }

  approveAll(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/approve-all`, {});
  }

  deleteRows(rows: CsvRow[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/delete`, { rows });
  }

  exportData(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, {
      responseType: 'blob'
    });
  }

  exportDifferences(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export-differences`, {
      responseType: 'blob'
    });
  }
}
