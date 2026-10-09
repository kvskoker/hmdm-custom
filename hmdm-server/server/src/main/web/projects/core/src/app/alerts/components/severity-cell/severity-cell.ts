import {Component} from '@angular/core';
import {BaseCellRenderer} from 'hmdm-ui-kit';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'core-severity-cell',
  imports: [
    TranslatePipe
  ],
  templateUrl: './severity-cell.html',
  styleUrl: './severity-cell.scss',
})
export class SeverityCell extends BaseCellRenderer {
  readonly mappedLevels: {[key: number]: string} = {
    10: 'table.lable.alerts.info',
    20: 'table.lable.alerts.warning',
    30: 'table.lable.alerts.severe',
  };
}
