import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-action-bar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  template: `
    <mat-toolbar class="action-bar">
      <div class="action-group">
        <!-- Approve actions -->
        <button mat-raised-button color="primary" 
                [disabled]="!hasSelection"
                (click)="approve.emit()">
          <mat-icon>check</mat-icon>
          Approve
        </button>
        <button mat-icon-button [matMenuTriggerFor]="approveMenu">
          <mat-icon>arrow_drop_down</mat-icon>
        </button>
        <mat-menu #approveMenu="matMenu">
          <button mat-menu-item (click)="approveAll.emit()">
            <mat-icon>done_all</mat-icon>
            <span>Approve All</span>
          </button>
        </mat-menu>
      </div>

      <div class="action-group">
        <!-- Edit actions -->
        <button mat-raised-button color="accent"
                [disabled]="!hasSelection"
                (click)="edit.emit()">
          <mat-icon>edit</mat-icon>
          Edit
        </button>
        <button mat-icon-button [matMenuTriggerFor]="editMenu">
          <mat-icon>arrow_drop_down</mat-icon>
        </button>
        <mat-menu #editMenu="matMenu">
          <button mat-menu-item (click)="deleteRow.emit()">
            <mat-icon>delete</mat-icon>
            <span>Delete Row</span>
          </button>
        </mat-menu>
      </div>

      <div class="action-group">
        <!-- Export actions -->
        <button mat-raised-button
                (click)="export.emit()">
          <mat-icon>download</mat-icon>
          Export
        </button>
        <button mat-icon-button [matMenuTriggerFor]="exportMenu">
          <mat-icon>arrow_drop_down</mat-icon>
        </button>
        <mat-menu #exportMenu="matMenu">
          <button mat-menu-item (click)="exportDifferences.emit()">
            <mat-icon>difference</mat-icon>
            <span>Export Differences</span>
          </button>
        </mat-menu>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .action-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 64px;
      background-color: white;
      box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
      padding: 0 20px;
      display: flex;
      gap: 20px;
      z-index: 1000;
    }

    .action-group {
      display: flex;
      align-items: center;
      gap: 4px;

      button[mat-raised-button] {
        min-width: 100px;
      }
    }
  `]
})
export class ActionBarComponent {
  @Input() hasSelection = false;

  @Output() approve = new EventEmitter<void>();
  @Output() approveAll = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() deleteRow = new EventEmitter<void>();
  @Output() export = new EventEmitter<void>();
  @Output() exportDifferences = new EventEmitter<void>();
}
