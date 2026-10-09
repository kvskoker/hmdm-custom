import { Component } from '@angular/core';
import { BaseCellRenderer } from 'hmdm-ui-kit';
import { TApplicationDTO } from '../../../entity/application/types/application-dto.type';

@Component({
  selector: 'core-app-name-cell',
  templateUrl: './app-name-cell.html',
  styleUrl: './app-name-cell.scss',
})
export class AppNameCell extends BaseCellRenderer<TApplicationDTO> {
  get value(): string {
    const data = this.params().data;

    if (data.type !== 'app') {
      return '';
    }

    return data.name;
  }
}
