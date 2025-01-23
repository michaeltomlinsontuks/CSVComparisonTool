import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CsvComparison, FileUploadResponse, ExportResponse } from '../models/csv.model';

@Injectable({
  providedIn: 'root'
})
export class CsvService {
  private apiUrl = 'http://localhost:3000/api/csv';

  constructor(private http: HttpClient) { }

  uploadFiles(files: File[]): Observable<FileUploadResponse> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return this.http.post<FileUploadResponse>(`${this.apiUrl}/upload`, formData);
  }

  compareFiles(file1: string, file2: string): Observable<CsvComparison> {
    return this.http.post<CsvComparison>(`${this.apiUrl}/compare`, { file1, file2 });
  }

  exportMerged(data: any[]): Observable<ExportResponse> {
    return this.http.post<ExportResponse>(`${this.apiUrl}/export`, { data });
  }
}
