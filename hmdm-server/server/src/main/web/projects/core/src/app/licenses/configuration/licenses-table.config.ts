import {Injectable} from '@angular/core';
import {TTableConfig} from 'hmdm-ui-kit';
import {LicensesActionCell} from '../components/licenses-action-cell/licenses-action-cell';
import {LicensesValidityColorCell} from '../components/licenses-validity-color-cell/licenses-validity-color-cell';
import {LicensesUrlCell} from '../components/licenses-url-cell/licenses-url-cell';
import {LicensesValidityCell} from '../components/licenses-validity-cell/licenses-validity-cell';

@Injectable({
  providedIn: 'root',
})
export class LicensesTableConfig {
  getConfig(): TTableConfig {
    return {
      columns: [
        {
          field: 'license',
          title: 'tab.license',
          cellRenderer: LicensesValidityColorCell
        },
        {
          field: 'signature',
          title: 'table.license.signature',
          cellRenderer: LicensesValidityColorCell
        },
        {
          field: 'status',
          title: 'table.license.valid',
          cellRenderer: LicensesValidityCell
        },
        {
          field: 'purchaseLink',
          title: '',
          cellRenderer: LicensesUrlCell
        },
        {
          field: 'actions',
          title: 'table.heading.file.actions',
          cellRenderer: LicensesActionCell,
          stickyEnd: true
        }
      ]
    };
  }
}
