import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { BaseCellRenderer } from '../../base/base-cell-renderer';

@Component({
  selector: 'hmdm-boolean-cell',
  templateUrl: './boolean-cell.html',
  styleUrl: './boolean-cell.scss',
  imports: [MatIconModule],
})
export class BooleanCell extends BaseCellRenderer {
  isTrue(): boolean {
    if (!this.params().provided['isShow']) {
      return !!this.params().value;
    }

    return !!this.params().provided['isShow'](this.params().data);
  }
}
