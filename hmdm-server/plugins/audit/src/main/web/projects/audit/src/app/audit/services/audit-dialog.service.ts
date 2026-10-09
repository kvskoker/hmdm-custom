import { inject, Injectable } from '@angular/core';
import { MatDialog } from 'hmdm-ui-kit';
import { AuditDetailsDialog } from '../components/audit-details-dialog/audit-details-dialog';
import { TAuditDTO } from '../types/audit-dto.type';

@Injectable()
export class AuditDialogService {
  private dialog: MatDialog = inject(MatDialog);

  openDetailsDialog(audit: TAuditDTO): void {
    this.dialog.open(AuditDetailsDialog, {
      data: audit,
    });
  }
}
