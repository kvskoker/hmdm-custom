import { Component, inject } from '@angular/core';
import { BaseCellRenderer, MatButtonModule, MatIconModule } from 'hmdm-ui-kit';
import { RulesDialogService } from '../../services/rules-dialog.service';
import { TRuleDTO } from '../../types/rule-dto.type';

@Component({
  selector: 'log-rule-actions-cell',
  templateUrl: './rule-actions-cell.html',
  styleUrl: './rule-actions-cell.scss',
  imports: [MatButtonModule, MatIconModule],
})
export class RuleActionsCell extends BaseCellRenderer<TRuleDTO> {
  private readonly rulesDialogService = inject(RulesDialogService);

  onDeleteClick(): void {
    this.rulesDialogService.openDeleteRuleDialog(this.params().data);
  }

  onEditClick(): void {
    this.rulesDialogService.openEditRuleDialog(this.params().data);
  }
}
