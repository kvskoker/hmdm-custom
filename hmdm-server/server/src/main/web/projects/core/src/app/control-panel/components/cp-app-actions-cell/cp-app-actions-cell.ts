import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseCellRenderer } from 'hmdm-ui-kit';
import { TApplicationDTO } from '../../../entity/application/types/application-dto.type';
import { ControlPanelAppsFacadeService } from '../../services/control-panel-apps-facade.service';

@Component({
  selector: 'core-cp-app-actions-cell',
  imports: [MatIconModule, MatButtonModule, TranslatePipe, MatTooltip],
  template: `
    <div class="table-action-cells">
      @if (params().data.commonApplication) {
        <button
          matIconButton
          [matTooltip]="'button.change.common.app' | translate"
          (click)="onEditClick()"
        >
          <mat-icon>edit</mat-icon>
        </button>

        <button
          matIconButton
          [matTooltip]="'button.delete.common.app' | translate"
          (click)="onDeleteClick()"
        >
          <mat-icon>delete</mat-icon>
        </button>
      } @else {
        <button
          matIconButton
          [matTooltip]="'button.turn.common.app' | translate"
          (click)="onTurnCommonClick()"
        >
          <mat-icon>share</mat-icon>
        </button>
      }
    </div>
  `,
})
export class CpAppActionsCell extends BaseCellRenderer<TApplicationDTO, null> {
  private readonly appsFacadeService = inject(ControlPanelAppsFacadeService);

  onEditClick(): void {
    this.appsFacadeService.openEditDialog(this.params().data);
  }

  onDeleteClick(): void {
    this.appsFacadeService.openDeleteConfirmDialog(this.params().data);
  }

  onTurnCommonClick(): void {
    this.appsFacadeService.turnIntoCommonApplication(this.params().data);
  }
}
