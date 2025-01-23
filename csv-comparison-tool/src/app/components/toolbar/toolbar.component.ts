import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  template: `
    <mat-toolbar color="primary">
      <span>CSV Comparison Tool</span>
      <span class="spacer"></span>
      
      <button mat-icon-button [matMenuTriggerFor]="menu" *ngIf="hasData">
        <mat-icon>more_vert</mat-icon>
      </button>
      
      <mat-menu #menu="matMenu">
        <button mat-menu-item (click)="exportAll.emit()">
          <mat-icon>download</mat-icon>
          <span>Export All</span>
        </button>
        <button mat-menu-item (click)="exportDifferences.emit()">
          <mat-icon>difference</mat-icon>
          <span>Export Differences</span>
        </button>
        <button mat-menu-item (click)="resetData.emit()">
          <mat-icon>refresh</mat-icon>
          <span>Reset</span>
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }
  `]
})
export class ToolbarComponent {
  @Input() hasData = false;
  @Output() exportAll = new EventEmitter<void>();
  @Output() exportDifferences = new EventEmitter<void>();
  @Output() resetData = new EventEmitter<void>();
}
