import { Component, inject } from '@angular/core';
import { BaseCellRenderer, MatButtonModule, MatIconModule } from 'hmdm-ui-kit';
import { AuditDialogService } from '../../services/audit-dialog.service';
import { TAuditDTO } from '../../types/audit-dto.type';

@Component({
  selector: 'audit-details-cell',
  templateUrl: './audit-details-cell.html',
  styleUrl: './audit-details-cell.scss',
  imports: [MatButtonModule, MatIconModule],
})
export class AuditDetailsCell extends BaseCellRenderer<TAuditDTO, void> {
  private readonly auditDialogService = inject(AuditDialogService);

  onOpenDetails(): void {
    const audit = this.params().data;
    this.auditDialogService.openDetailsDialog(audit);
  }
}
