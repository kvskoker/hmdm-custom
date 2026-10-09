import { DatePipe } from '@angular/common';
import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseCellRenderer } from '../../base/base-cell-renderer';

@Component({
  selector: 'hmdm-datetime-cell',
  templateUrl: './datetime-cell.html',
  styleUrl: './datetime-cell.css',
  imports: [DatePipe, TranslatePipe],
})
export class DatetimeCell extends BaseCellRenderer implements OnInit {
  date: WritableSignal<Date | null> = signal(null);

  get timeFormat(): string {
    return this.params().provided.timeFormat || 'short';
  }

  ngOnInit(): void {
    const value = this.params().value;

    if (typeof value === 'number') {
      this.date.set(new Date(value));
    }
  }
}
