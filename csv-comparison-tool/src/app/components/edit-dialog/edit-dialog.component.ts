import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CsvRow } from '../../models/csv.model';

@Component({
  selector: 'app-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Edit Row</h2>
    <mat-dialog-content>
      <div class="form-fields">
        <mat-form-field *ngFor="let key of Object.keys(data.row)">
          <mat-label>{{ key }}</mat-label>
          <input matInput [(ngModel)]="editedRow[key]">
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()">Save</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-fields {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
      max-height: 60vh;
      overflow-y: auto;
    }

    mat-form-field {
      width: 100%;
    }
  `]
})
export class EditDialogComponent {
  editedRow: CsvRow;
  Object = Object; // Make Object available in template

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { row: CsvRow },
    private dialogRef: MatDialogRef<EditDialogComponent>
  ) {
    this.editedRow = { ...data.row };
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.editedRow);
  }
}
