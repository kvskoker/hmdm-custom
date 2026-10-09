import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseCellRenderer } from '../../base/base-cell-renderer';

@Component({
  selector: 'hmdm-translate-cell',
  templateUrl: './translate-cell.html',
  styleUrl: './translate-cell.css',
  imports: [TranslatePipe],
})
export class TranslateCell extends BaseCellRenderer {}
