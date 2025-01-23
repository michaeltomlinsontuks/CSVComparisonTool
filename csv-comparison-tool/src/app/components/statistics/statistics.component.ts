import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ComparisonData } from '../../models/csv.model';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule
  ],
  template: `
    <div class="statistics-container">
      <mat-card class="stat-card">
        <mat-card-content>
          <div class="stats-grid">
            <!-- Total Rows -->
            <div class="stat-item">
              <div class="stat-icon total">
                <mat-icon>table_rows</mat-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ totalRows }}</div>
                <div class="stat-label">Total Rows</div>
              </div>
            </div>

            <!-- Added Rows -->
            <div class="stat-item">
              <div class="stat-icon added">
                <mat-icon>add_circle</mat-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value status-added">{{ addedRows }}</div>
                <div class="stat-label">Added</div>
              </div>
            </div>

            <!-- Removed Rows -->
            <div class="stat-item">
              <div class="stat-icon removed">
                <mat-icon>remove_circle</mat-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value status-removed">{{ removedRows }}</div>
                <div class="stat-label">Removed</div>
              </div>
            </div>

            <!-- Modified Rows -->
            <div class="stat-item">
              <div class="stat-icon modified">
                <mat-icon>edit</mat-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value status-modified">{{ modifiedRows }}</div>
                <div class="stat-label">Modified</div>
              </div>
            </div>
          </div>

          <div class="progress-section">
            <div class="progress-label">
              <span>Progress</span>
              <span>{{ progressPercentage }}% Complete</span>
            </div>
            <mat-progress-bar
              mode="determinate"
              [value]="progressPercentage">
            </mat-progress-bar>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .statistics-container {
      padding: 16px;
    }

    .stat-card {
      background: white;
      border-radius: 8px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border-radius: 8px;
      background: #f8f9fa;
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-2px);
      }
    }

    .stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 12px;

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        color: white;
      }

      &.total {
        background: #2196f3;
      }

      &.added {
        background: #4caf50;
      }

      &.removed {
        background: #f44336;
      }

      &.modified {
        background: #ff9800;
      }
    }

    .stat-content {
      flex: 1;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 500;
      line-height: 1.2;
      color: #2c3e50;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
      margin-top: 4px;
    }

    .progress-section {
      margin-top: 24px;
      padding: 0 16px;
    }

    .progress-label {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      color: #666;
      font-size: 14px;
    }

    mat-progress-bar {
      height: 8px;
      border-radius: 4px;
    }

    ::ng-deep {
      .mat-mdc-progress-bar {
        --mdc-linear-progress-active-indicator-color: #2196f3;
      }
    }
  `]
})
export class StatisticsComponent {
  @Input() comparisonData!: ComparisonData;
  @Input() remainingToProcess = 0;

  get totalRows(): number {
    if (!this.comparisonData) return 0;
    return this.comparisonData.added.length +
           this.comparisonData.removed.length +
           this.comparisonData.modified.length +
           this.comparisonData.unchanged.length;
  }

  get addedRows(): number {
    return this.comparisonData?.added.length || 0;
  }

  get removedRows(): number {
    return this.comparisonData?.removed.length || 0;
  }

  get modifiedRows(): number {
    return this.comparisonData?.modified.length || 0;
  }

  get progressPercentage(): number {
    if (!this.totalRows) return 0;
    const processed = this.totalRows - this.remainingToProcess;
    return Math.round((processed / this.totalRows) * 100);
  }
}
