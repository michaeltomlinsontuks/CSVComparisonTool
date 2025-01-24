import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { ComparisonTableComponent } from './components/comparison-table/comparison-table.component';
import { ActionBarComponent } from './components/action-bar/action-bar.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ComparisonData, CsvRow } from './models/csv.model';
import { CsvService } from './services/csv.service';
import { EditDialogComponent } from './components/edit-dialog/edit-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FileUploadComponent,
    ComparisonTableComponent,
    ActionBarComponent,
    StatisticsComponent,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="app-container">
      <app-file-upload
        #fileUpload
        [class.minimized]="hasComparisonData"
        (filesSelected)="onFilesSelected($event)">
      </app-file-upload>

      <ng-container *ngIf="hasComparisonData">
        <app-statistics
          [comparisonData]="comparisonData!"
          [remainingToProcess]="remainingToProcess">
        </app-statistics>

        <app-comparison-table
          #comparisonTable
          [comparisonData]="comparisonData!"
          (selectionChange)="onSelectionChange($event)">
        </app-comparison-table>

        <app-action-bar
          [hasSelection]="hasSelection"
          (approve)="approveSelected()"
          (approveAll)="approveAll()"
          (edit)="editSelected()"
          (deleteRow)="deleteSelected()"
          (export)="exportData()"
          (exportDifferences)="exportDifferences()">
        </app-action-bar>
      </ng-container>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background-color: #f5f5f5;
      padding-bottom: 80px; /* Space for action bar */
    }

    .minimized {
      height: 0;
      overflow: hidden;
    }
  `]
})
export class AppComponent {
  comparisonData: ComparisonData | null = null;
  selectedRows: CsvRow[] = [];
  hasSelection = false;

  constructor(
    private csvService: CsvService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  get hasComparisonData(): boolean {
    return this.comparisonData !== null;
  }

  get remainingToProcess(): number {
    if (!this.comparisonData) return 0;
    return (
      this.comparisonData.added.length +
      this.comparisonData.removed.length +
      this.comparisonData.modified.length
    );
  }

  onFilesSelected([file1, file2]: [File, File]): void {
    this.csvService.compareFiles(file1, file2).subscribe({
      next: (data) => {
        this.comparisonData = data;
        this.showMessage('Files compared successfully');
      },
      error: (error) => {
        this.showMessage('Error comparing files: ' + error.message, true);
      }
    });
  }

  onSelectionChange(rows: CsvRow[]): void {
    this.selectedRows = rows;
    this.hasSelection = rows.length > 0;
  }

  approveSelected(): void {
    if (!this.selectedRows.length) return;
    this.csvService.approveRows(this.selectedRows).subscribe({
      next: () => {
        this.showMessage('Changes approved');
        this.updateComparisonData();
        this.selectedRows = [];
        this.hasSelection = false;
      },
      error: (error) => {
        this.showMessage('Error approving changes: ' + error.message, true);
      }
    });
  }

  approveAll(): void {
    this.csvService.approveAll().subscribe({
      next: () => {
        this.showMessage('All changes approved');
        this.updateComparisonData();
        this.selectedRows = [];
        this.hasSelection = false;
      },
      error: (error) => {
        this.showMessage('Error approving all changes: ' + error.message, true);
      }
    });
  }

  editSelected(): void {
    if (!this.selectedRows.length) return;
    
    const dialogRef = this.dialog.open(EditDialogComponent, {
      width: '600px',
      data: { row: this.selectedRows[0] }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // TODO: Implement backend endpoint for updating rows
        this.showMessage('Row updated successfully');
        this.updateComparisonData();
      }
    });
  }

  deleteSelected(): void {
    if (!this.selectedRows.length) return;
    this.csvService.deleteRows(this.selectedRows).subscribe({
      next: () => {
        this.showMessage('Rows deleted');
        this.updateComparisonData();
        this.selectedRows = [];
        this.hasSelection = false;
      },
      error: (error) => {
        this.showMessage('Error deleting rows: ' + error.message, true);
      }
    });
  }

  exportData(): void {
    this.csvService.exportData().subscribe({
      next: (blob) => {
        this.downloadBlob(blob, 'comparison_result.csv');
        this.showMessage('Data exported successfully');
      },
      error: (error) => {
        this.showMessage('Error exporting data: ' + error.message, true);
      }
    });
  }

  exportDifferences(): void {
    this.csvService.exportDifferences().subscribe({
      next: (blob) => {
        this.downloadBlob(blob, 'differences.csv');
        this.showMessage('Differences exported successfully');
      },
      error: (error) => {
        this.showMessage('Error exporting differences: ' + error.message, true);
      }
    });
  }

  private showMessage(message: string, isError = false): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: isError ? ['error-snackbar'] : undefined
    });
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private updateComparisonData(): void {
    // TODO: Implement refresh of comparison data after changes
    if (this.comparisonData) {
      // Remove approved/deleted rows from the lists
      this.selectedRows.forEach(row => {
        this.comparisonData!.added = this.comparisonData!.added.filter(r => r !== row);
        this.comparisonData!.removed = this.comparisonData!.removed.filter(r => r !== row);
        this.comparisonData!.modified = this.comparisonData!.modified.filter(r => r.modified !== row);
      });
    }
  }
}
