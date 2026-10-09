import { NgClass } from '@angular/common';
import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { BaseCellRenderer } from '../../base/base-cell-renderer';
import { TStatusCellParams } from '../../types/status-cell-params.type';
import { TStatus } from '../../types/status.type';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'mhdh-status-cell',
  templateUrl: './status-cell.html',
  styleUrls: ['./status-cell.scss'],
  imports: [NgClass, MatTooltipModule],
})
export class StatusCellRenderer<T, P>
  extends BaseCellRenderer<T, TStatusCellParams<T>>
  implements OnInit
{
  status: WritableSignal<TStatus> = signal<TStatus>({ color: 'gray' });

  ngOnInit(): void {
    const status = this.params().provided.status(this.params().data);

    if (status) {
      this.status.set(status);
    }
  }
}
