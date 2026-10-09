import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import {
  DialogBase,
  MAT_DIALOG_DATA,
  DialogTemplate,
  MatButtonModule,
  TranslatePipe,
} from 'hmdm-ui-kit';
import { TAuditDTO } from '../../types/audit-dto.type';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'audit-audit-details-dialog',
  templateUrl: './audit-details-dialog.html',
  styleUrl: './audit-details-dialog.scss',
  imports: [DialogTemplate, DatePipe, MatButtonModule, TranslatePipe],
})
export class AuditDetailsDialog extends DialogBase {
  data: TAuditDTO = inject(MAT_DIALOG_DATA);
  date: WritableSignal<Date> = signal(new Date(this.data.createTime));

  override onSave(): void {
    // No save action needed for details dialog
  }
}
