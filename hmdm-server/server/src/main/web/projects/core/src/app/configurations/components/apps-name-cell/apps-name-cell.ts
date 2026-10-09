import { Component } from '@angular/core';
import { BaseCellRenderer } from 'hmdm-ui-kit';
import { TApplicationDTO } from '../../../entity/application/types/application-dto.type';

@Component({
  selector: 'core-apps-name-cell',
  templateUrl: './apps-name-cell.html',
  styleUrl: './apps-name-cell.scss',
})
export class AppsNameCell extends BaseCellRenderer<TApplicationDTO> {
  getPkg(): string {
    if (this.params().data.type !== 'app') {
      return '';
    }

    return this.params().data.pkg;
  }
}
