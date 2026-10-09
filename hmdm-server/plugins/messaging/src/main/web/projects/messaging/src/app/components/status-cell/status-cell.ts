import { Component, effect, signal, WritableSignal } from '@angular/core';
import { BaseCellRenderer, TranslatePipe } from 'hmdm-ui-kit';
import { STATUS_MAPPER } from '../../const/status-mapper.const';

@Component({
  selector: 'messaging-status-cell',
  templateUrl: './status-cell.html',
  styleUrl: './status-cell.scss',
  imports: [TranslatePipe],
})
export class StatusCell extends BaseCellRenderer {
  status: WritableSignal<string> = signal('');

  constructor() {
    super();

    effect(() => {
      const cellValue = this.params().value;

      this.status.set(STATUS_MAPPER[cellValue]);
    });
  }
}
