import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { ComparisonTableComponent } from './components/comparison-table/comparison-table.component';
import { CsvService } from './services/csv.service';
import { CsvComparison } from './models/csv.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ToolbarComponent,
    FileUploadComponent,
    ComparisonTableComponent
  ]
})
export class AppComponent {
  comparisonData?: CsvComparison;
  uploadedFiles: string[] = [];

  constructor(
    private csvService: CsvService,
    private snackBar: MatSnackBar
  ) {}

  onFilesSelected(files: File[]) {
    this.csvService.uploadFiles(files).subscribe({
      next: (response) => {
        this.uploadedFiles = response.files;
        this.compareFiles();
      },
      error: (error) => {
        this.snackBar.open('Error uploading files: ' + error.message, 'Close', {
          duration: 3000
        });
      }
    });
  }

  private compareFiles() {
    if (this.uploadedFiles.length !== 2) return;

    this.csvService.compareFiles(this.uploadedFiles[0], this.uploadedFiles[1]).subscribe({
      next: (data) => {
        this.comparisonData = data;
      },
      error: (error) => {
        this.snackBar.open('Error comparing files: ' + error.message, 'Close', {
          duration: 3000
        });
      }
    });
  }

  onExportAll() {
    if (!this.comparisonData) return;

    const allData = [
      ...this.comparisonData.added,
      ...this.comparisonData.removed,
      ...this.comparisonData.modified.map(row => row.modified),
      ...this.comparisonData.unchanged
    ];

    this.exportData(allData);
  }

  onExportDifferences() {
    if (!this.comparisonData) return;

    const differences = [
      ...this.comparisonData.added,
      ...this.comparisonData.removed,
      ...this.comparisonData.modified.map(row => row.modified)
    ];

    this.exportData(differences);
  }

  private exportData(data: any[]) {
    this.csvService.exportMerged(data).subscribe({
      next: (response) => {
        this.snackBar.open('Data exported successfully', 'Close', {
          duration: 3000
        });
      },
      error: (error) => {
        this.snackBar.open('Error exporting data: ' + error.message, 'Close', {
          duration: 3000
        });
      }
    });
  }

  onResetData() {
    this.comparisonData = undefined;
    this.uploadedFiles = [];
  }
}
