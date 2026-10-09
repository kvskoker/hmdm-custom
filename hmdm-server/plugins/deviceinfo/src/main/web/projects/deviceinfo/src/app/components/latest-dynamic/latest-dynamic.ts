import { Component, inject } from '@angular/core';
import { DetailsFacadeService } from '../../services/details-facade.service';
import { DatePipe, NgClass } from '@angular/common';
import { TranslatePipe } from 'hmdm-ui-kit';

@Component({
  selector: 'di-latest-dynamic',
  templateUrl: './latest-dynamic.html',
  styleUrl: './latest-dynamic.scss',
  imports: [DatePipe, NgClass, TranslatePipe],
})
export class LatestDynamic {
  private readonly detailsFacadeService = inject(DetailsFacadeService);

  details = this.detailsFacadeService.details;

  formatMultiLine(text: string | undefined): string {
    if (!text) return '';
    return text.replace(/\n/g, '<br/>');
  }
}
