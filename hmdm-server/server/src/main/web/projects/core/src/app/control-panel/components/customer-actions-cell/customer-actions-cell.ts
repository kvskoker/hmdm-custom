import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseCellRenderer } from 'hmdm-ui-kit';
import { CustomersFacadeService } from '../../services/customers-facade.service';
import { TCustomer } from '../../types/customer.type';

@Component({
  selector: 'core-customer-actions-cell',
  imports: [MatIconModule, MatButtonModule, TranslatePipe, MatTooltip],
  template: `
    <div class="table-action-cells">
      <button matIconButton [matTooltip]="'button.change' | translate" (click)="onEditClick()">
        <mat-icon>edit</mat-icon>
      </button>
      <button
        matIconButton
        [matTooltip]="'button.change.password' | translate"
        (click)="onPasswordClick()"
      >
        <mat-icon>lock_reset</mat-icon>
      </button>
      <button matIconButton [matTooltip]="'button.login' | translate" (click)="onLoginAsClick()">
        <mat-icon>login</mat-icon>
      </button>
      <button matIconButton [matTooltip]="'button.delete' | translate" (click)="onDeleteClick()">
        <mat-icon>delete</mat-icon>
      </button>
    </div>
  `,
})
export class CustomerActionsCell extends BaseCellRenderer<TCustomer, null> {
  private readonly customersFacadeService = inject(CustomersFacadeService);

  onEditClick(): void {
    this.customersFacadeService.openEditDialog(this.params().data);
  }

  onPasswordClick(): void {
    this.customersFacadeService.openPasswordChangeDialog(this.params().data);
  }

  onLoginAsClick(): void {
    this.customersFacadeService.loginAsCustomer(this.params().data);
  }

  onDeleteClick(): void {
    this.customersFacadeService.openDeleteConfirmDialog(this.params().data);
  }
}
