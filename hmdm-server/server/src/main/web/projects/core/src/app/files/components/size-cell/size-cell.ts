import { Component } from '@angular/core';
import { BaseCellRenderer } from 'hmdm-ui-kit';

@Component({
  selector: 'core-size-cell',
  templateUrl: './size-cell.html',
  styleUrl: './size-cell.scss',
  imports: [],
})
export class SizeCell extends BaseCellRenderer {
  getValue(): string {
    const size = this.params().value;

    if (size === -1) {
      return 'DELETED';
    }

    if (size === 0) {
      return '';
    }

    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else if (size < 1024 * 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
  }
}
