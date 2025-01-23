import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ]
})
export class FileUploadComponent {
  @Output() filesSelected = new EventEmitter<File[]>();
  
  files: File[] = [];
  isDragging = false;

  constructor(private snackBar: MatSnackBar) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = Array.from(event.dataTransfer?.files || []);
    this.handleFiles(files);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      this.handleFiles(files);
    }
  }

  private handleFiles(files: File[]) {
    if (files.length !== 2) {
      this.snackBar.open('Please select exactly 2 CSV files', 'Close', { duration: 3000 });
      return;
    }

    if (!files.every(file => file.name.endsWith('.csv'))) {
      this.snackBar.open('Please select only CSV files', 'Close', { duration: 3000 });
      return;
    }

    this.files = files;
    this.filesSelected.emit(files);
  }

  resetFiles() {
    this.files = [];
  }
}
