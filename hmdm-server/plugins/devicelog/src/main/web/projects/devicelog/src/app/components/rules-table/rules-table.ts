import { Component, inject } from '@angular/core';
import { Table } from 'hmdm-ui-kit';
import { RulesTableConfig } from '../../config/rules-table.config';
import { RulesFacadeService } from '../../services/rules-facade.service';

@Component({
  selector: 'log-rules-table',
  templateUrl: './rules-table.html',
  styleUrl: './rules-table.scss',
  imports: [Table],
})
export class RulesTable {
  private readonly rulesTableConfig = inject(RulesTableConfig);
  private readonly rulesFacadeService = inject(RulesFacadeService);

  tableConfig = this.rulesTableConfig.getConfig();
  tableData = this.rulesFacadeService.rules;
}
