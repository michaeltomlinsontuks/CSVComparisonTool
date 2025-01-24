import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, mergeMap, tap } from 'rxjs/operators';
import { BackendService } from './backend.service';
import { ComparisonData, CsvRow } from '../models/csv.model';

@Injectable({
  providedIn: 'root'
})
export class CsvService {
  private file1Id: string | null = null;
  private file2Id: string | null = null;

  constructor(private backendService: BackendService) {}

  compareFiles(file1: File, file2: File): Observable<ComparisonData> {
    return this.backendService.uploadFiles(file1, file2).pipe(
      tap(uploadResponse => {
        this.file1Id = uploadResponse.file1Id;
        this.file2Id = uploadResponse.file2Id;
      }),
      mergeMap(() => {
        if (!this.file1Id || !this.file2Id) {
          return throwError(() => new Error('File upload failed'));
        }
        return this.backendService.compareFiles(this.file1Id, this.file2Id);
      }),
      tap(result => {
        console.log('Comparison result:', result);
      }),
      catchError(error => {
        console.error('Error comparing files:', error);
        return throwError(() => error);
      })
    );
  }

  approveRows(rows: CsvRow[]): Observable<{ message: string }> {
    return this.backendService.approveRows(rows).pipe(
      tap(response => {
        console.log('Approve response:', response);
      }),
      catchError(error => {
        console.error('Error approving rows:', error);
        return throwError(() => error);
      })
    );
  }

  approveAll(): Observable<{ message: string }> {
    return this.backendService.approveAll().pipe(
      tap(response => {
        console.log('Approve all response:', response);
      }),
      catchError(error => {
        console.error('Error approving all changes:', error);
        return throwError(() => error);
      })
    );
  }

  deleteRows(rows: CsvRow[]): Observable<{ message: string }> {
    return this.backendService.deleteRows(rows).pipe(
      tap(response => {
        console.log('Delete response:', response);
      }),
      catchError(error => {
        console.error('Error deleting rows:', error);
        return throwError(() => error);
      })
    );
  }

  exportData(): Observable<Blob> {
    if (!this.file1Id || !this.file2Id) {
      return throwError(() => new Error('No files have been compared yet'));
    }

    return this.backendService.exportChanges({ 
      file1Id: this.file1Id, 
      file2Id: this.file2Id 
    }).pipe(
      tap(blob => {
        console.log('Export response size:', blob.size);
      }),
      catchError(error => {
        console.error('Error exporting data:', error);
        return throwError(() => error);
      })
    );
  }

  exportDifferences(): Observable<Blob> {
    if (!this.file1Id || !this.file2Id) {
      return throwError(() => new Error('No files have been compared yet'));
    }

    return this.backendService.exportChanges({ 
      file1Id: this.file1Id, 
      file2Id: this.file2Id,
      type: 'differences'
    }).pipe(
      tap(blob => {
        console.log('Export differences response size:', blob.size);
      }),
      catchError(error => {
        console.error('Error exporting differences:', error);
        return throwError(() => error);
      })
    );
  }
}
