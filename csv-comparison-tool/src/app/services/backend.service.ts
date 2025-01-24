import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ComparisonData, CsvRow } from '../models/csv.model';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private apiUrl = 'http://localhost:3000/api/csv';

  constructor(private http: HttpClient) {}

  uploadFiles(file1: File, file2: File): Observable<{ message: string; file1Id: string; file2Id: string }> {
    const formData = new FormData();
    formData.append('files', file1);
    formData.append('files', file2);
    return this.http.post<{ message: string; file1Id: string; file2Id: string }>(
      `${this.apiUrl}/upload`,
      formData
    );
  }

  compareFiles(file1Id: string, file2Id: string): Observable<ComparisonData> {
    return this.http.post<ComparisonData>(
      `${this.apiUrl}/compare`,
      { file1Id, file2Id }
    );
  }

  approveRows(rows: CsvRow[]): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/approve`,
      { changes: rows }
    );
  }

  approveAll(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/approve-all`,
      {}
    );
  }

  deleteRows(rows: CsvRow[]): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/delete`,
      { rows }
    );
  }

  exportChanges(options: { file1Id: string; file2Id: string; type?: 'differences' }): Observable<Blob> {
    return this.http.post(
      `${this.apiUrl}/export${options.type ? `?type=${options.type}` : ''}`,
      { file1Id: options.file1Id, file2Id: options.file2Id },
      { responseType: 'blob' }
    );
  }
}
