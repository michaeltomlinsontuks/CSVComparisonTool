import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ComparisonTableComponent } from './components/comparison-table/comparison-table.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { ActionBarComponent } from './components/action-bar/action-bar.component';
import { CsvService } from './services/csv.service';
import { ComparisonData, CsvRow } from './models/csv.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    ComparisonTableComponent,
    FileUploadComponent,
    StatisticsComponent,
    ActionBarComponent
  ],
  template: `
    <div class="app-container">
      <app-file-upload
        (filesSelected)="onFilesSelected($event)"
        #fileUpload>
      </app-file-upload>

      <app-statistics
        *ngIf="comparisonData"
        [comparisonData]="comparisonData"
        [remainingToProcess]="getRemainingToProcess()">
      </app-statistics>

      <app-comparison-table
        *ngIf="comparisonData"
        [comparisonData]="comparisonData"
        (selectionChange)="onSelectionChange($event)"
        #comparisonTable>
      </app-comparison-table>

      <app-action-bar
        *ngIf="comparisonData"
        [hasSelection]="hasSelection"
        (approve)="approveSelected()"
        (approveAll)="approveAll()"
        (edit)="editSelected()"
        (deleteRow)="deleteSelected()"
        (export)="exportData()"
        (exportDifferences)="exportDifferences()">
      </app-action-bar>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: #f5f5f5;
    }

    app-comparison-table {
      flex: 1;
      overflow: hidden;
    }
  `]
})
export class AppComponent {
  comparisonData: ComparisonData | null = null;
  hasSelection = false;
  selectedRows: CsvRow[] = [];

  constructor(
    private csvService: CsvService,
    private snackBar: MatSnackBar
  ) {}

  onFilesSelected(files: [File, File]): void {
    this.csvService.compareFiles(files[0], files[1]).subscribe({
      next: (data: ComparisonData) => {
        this.comparisonData = data;
        this.showNotification('Files compared successfully');
      },
      error: (error: Error) => {
        this.showNotification('Error comparing files: ' + error.message, true);
      }
    });
  }

  onSelectionChange(selectedRows: CsvRow[]): void {
    this.selectedRows = selectedRows;
    this.hasSelection = selectedRows.length > 0;
  }

  approveSelected(): void {
    if (!this.comparisonData || !this.selectedRows.length) return;
    
    this.csvService.approveRows(this.selectedRows).subscribe({
      next: () => {
        this.showNotification('Selected rows approved');
        // Update local state
        this.selectedRows.forEach(row => {
          (row as any)._status = 'unchanged';
        });
        this.selectedRows = [];
        this.hasSelection = false;
      },
      error: (error: Error) => {
        this.showNotification('Error approving rows: ' + error.message, true);
      }
    });
  }

  approveAll(): void {
    if (!this.comparisonData) return;

    this.csvService.approveAll().subscribe({
      next: () => {
        this.showNotification('All changes approved');
        // Update local state
        if (this.comparisonData) {
          this.comparisonData.added = [];
          this.comparisonData.removed = [];
          this.comparisonData.modified = [];
        }
      },
      error: (error: Error) => {
        this.showNotification('Error approving all changes: ' + error.message, true);
      }
    });
  }

  editSelected(): void {
    if (!this.selectedRows.length) return;
    // TODO: Implement edit dialog
    this.showNotification('Edit functionality coming soon');
  }

  deleteSelected(): void {
    if (!this.selectedRows.length) return;
    
    this.csvService.deleteRows(this.selectedRows).subscribe({
      next: () => {
        this.showNotification('Selected rows deleted');
        // Update local state
        this.selectedRows.forEach(row => {
          const index = this.comparisonData?.unchanged.findIndex(r => r === row);
          if (index !== undefined && index !== -1) {
            this.comparisonData?.unchanged.splice(index, 1);
          }
        });
        this.selectedRows = [];
        this.hasSelection = false;
      },
      error: (error: Error) => {
        this.showNotification('Error deleting rows: ' + error.message, true);
      }
    });
  }

  exportData(): void {
    if (!this.comparisonData) return;
    
    this.csvService.exportData().subscribe({
      next: (blob: Blob) => {
        this.downloadFile(blob, 'exported_data.csv');
        this.showNotification('Data exported successfully');
      },
      error: (error: Error) => {
        this.showNotification('Error exporting data: ' + error.message, true);
      }
    });
  }

  exportDifferences(): void {
    if (!this.comparisonData) return;
    
    this.csvService.exportDifferences().subscribe({
      next: (blob: Blob) => {
        this.downloadFile(blob, 'differences.csv');
        this.showNotification('Differences exported successfully');
      },
      error: (error: Error) => {
        this.showNotification('Error exporting differences: ' + error.message, true);
      }
    });
  }

  getRemainingToProcess(): number {
    if (!this.comparisonData) return 0;
    return this.comparisonData.added.length +
           this.comparisonData.removed.length +
           this.comparisonData.modified.length;
  }

  private showNotification(message: string, isError = false): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
