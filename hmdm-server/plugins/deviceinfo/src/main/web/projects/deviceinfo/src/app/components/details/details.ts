import { Component, inject } from '@angular/core';
import { DetailsFacadeService } from '../../services/details-facade.service';
import { LatestDynamic } from '../latest-dynamic/latest-dynamic';
import { DeviceInfo } from '../device-info/device-info';

@Component({
  selector: 'di-details',
  templateUrl: './details.html',
  styleUrl: './details.scss',
  imports: [LatestDynamic, DeviceInfo],
})
export class Details {
  private readonly detailsFacadeService = inject(DetailsFacadeService);

  details = this.detailsFacadeService.details;
}
