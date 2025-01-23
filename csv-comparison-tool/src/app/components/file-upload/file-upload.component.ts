import { Component, EventEmitter, Output, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

interface UploadZone {
  file: File | null;
  isDragging: boolean;
  label: string;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule
  ],
  template: `
    <div class="upload-container" [class.minimized]="isMinimized">
      <div class="upload-zones">
        <div class="upload-zone" *ngFor="let zone of zones; let i = index"
             [class.dragging]="zone.isDragging"
             (dragover)="onDragOver($event, i)"
             (dragleave)="onDragLeave($event, i)"
             (drop)="onDrop($event, i)">
          <mat-card>
            <mat-card-content>
              <div class="upload-area">
                <mat-icon>upload_file</mat-icon>
                <p>{{ zone.label }}</p>
                <p class="sub-text">Drop CSV file here</p>
                <button mat-raised-button color="primary" (click)="openFileInput(i)">
                  Select File
                </button>
                <input #fileInput type="file" 
                       [hidden]="true"
                       accept=".csv"
                       (change)="onFileSelected($event, i)">
                <p *ngIf="zone.file" class="file-name">
                  {{ zone.file.name }}
                </p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <div class="upload-actions" *ngIf="canCompare">
        <button mat-raised-button color="primary" (click)="compareFiles()">
          Compare Files
        </button>
      </div>

      <mat-progress-bar *ngIf="isProcessing" mode="indeterminate"></mat-progress-bar>
    </div>
  `,
  styles: [`
    .upload-container {
      padding: 20px;
      transition: all 0.3s ease;

      &.minimized {
        padding: 0;
        height: 0;
        overflow: hidden;
      }
    }

    .upload-zones {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }

    .upload-zone {
      flex: 1;
      transition: all 0.3s ease;

      &.dragging {
        transform: scale(1.02);
        mat-card {
          border: 2px dashed #2196f3;
          background-color: rgba(33, 150, 243, 0.1);
        }
      }
    }

    .upload-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      text-align: center;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        color: #666;
      }

      p {
        margin: 8px 0;
        color: #666;

        &.sub-text {
          font-size: 0.9em;
          color: #999;
        }

        &.file-name {
          color: #2196f3;
          font-weight: 500;
        }
      }
    }

    .upload-actions {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }
  `]
})
export class FileUploadComponent {
  @Output() filesSelected = new EventEmitter<[File, File]>();
  @ViewChildren('fileInput') fileInputs!: QueryList<ElementRef<HTMLInputElement>>;
  
  isProcessing = false;
  isMinimized = false;
  
  zones: UploadZone[] = [
    { file: null, isDragging: false, label: 'Base CSV' },
    { file: null, isDragging: false, label: 'Updated CSV' }
  ];

  get canCompare(): boolean {
    return this.zones.every(zone => zone.file !== null);
  }

  openFileInput(index: number): void {
    const inputs = this.fileInputs.toArray();
    if (inputs[index]) {
      inputs[index].nativeElement.click();
    }
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    event.stopPropagation();
    this.zones[index].isDragging = true;
  }

  onDragLeave(event: DragEvent, index: number): void {
    event.preventDefault();
    event.stopPropagation();
    this.zones[index].isDragging = false;
  }

  onDrop(event: DragEvent, index: number): void {
    event.preventDefault();
    event.stopPropagation();
    this.zones[index].isDragging = false;

    const files = Array.from(event.dataTransfer?.files || []);
    if (files.length > 0 && files[0].name.endsWith('.csv')) {
      this.zones[index].file = files[0];
    }
  }

  onFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.zones[index].file = input.files[0];
    }
  }

  compareFiles(): void {
    if (!this.canCompare) return;
    
    this.isProcessing = true;
    const files = this.zones.map(zone => zone.file) as [File, File];
    this.filesSelected.emit(files);
  }

  minimize(): void {
    this.isMinimized = true;
  }

  maximize(): void {
    this.isMinimized = false;
  }
}
