import { Injectable } from '@angular/core';
import { BooleanCell, TTableConfig } from 'hmdm-ui-kit';
import { RuleActionsCell } from '../components/rule-actions-cell/rule-actions-cell';

@Injectable({
  providedIn: 'root',
})
export class RulesTableConfig {
  getConfig(): TTableConfig {
    return {
      columns: [
        {
          field: 'name',
          title: 'plugin.devicelog.settings.rules.heading.name',
        },
        {
          field: 'active',
          title: 'plugin.devicelog.settings.rules.heading.active',
          cellRenderer: BooleanCell,
        },
        {
          field: 'severity',
          title: 'plugin.devicelog.settings.rules.heading.severity',
        },
        {
          field: 'filter',
          title: 'plugin.devicelog.settings.rules.heading.filter',
        },
        {
          field: 'applicationPkg',
          title: 'plugin.devicelog.settings.rules.heading.application',
        },
        {
          field: 'configurationName',
          title: 'plugin.devicelog.settings.rules.heading.configuration',
        },
        {
          field: 'groupName',
          title: 'plugin.devicelog.settings.rules.heading.group',
        },
        {
          title: 'table.heading.users.actions',
          cellRenderer: RuleActionsCell,
          stickyEnd: true,
        },
      ],
    };
  }
}
