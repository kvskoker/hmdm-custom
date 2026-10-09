import { Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  AsyncSelectSearch,
  BaseComponent,
  DevicesAutocompleteService,
  LoaderDirective,
  MatButtonModule,
  MatCardModule,
  MatDivider,
  MatIconModule,
  TranslatePipe,
} from 'hmdm-ui-kit';
import { AppsTable } from '../../components/apps-table/apps-table';
import { Details } from '../../components/details/details';
import { DetailsFacadeService } from '../../services/details-facade.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'di-info',
  templateUrl: './info.html',
  styleUrl: './info.scss',
  imports: [
    MatCardModule,
    LoaderDirective,
    TranslatePipe,
    MatIconModule,
    MatDivider,
    Details,
    AsyncSelectSearch,
    AppsTable,
    MatButtonModule,
    ReactiveFormsModule,
  ],
})
export class Info extends BaseComponent implements OnInit {
  private readonly detailsFacadeService = inject(DetailsFacadeService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  deviceSearchControl = new FormControl<string | null>(null);
  deviceAutocompleteService = new DevicesAutocompleteService('name', 'name');
  isLoadingDetails = this.detailsFacadeService.isLoadingDetails;
  details = this.detailsFacadeService.details;

  ngOnInit(): void {
    this.detailsFacadeService.clearState();

    if (this.activatedRoute.snapshot.queryParams['deviceNumber']) {
      const value = this.activatedRoute.snapshot.queryParams['deviceNumber'];

      setTimeout(() => {
        this.deviceSearchControl.setValue(value, { emitEvent: false });
        this.detailsFacadeService.getDetails(value);
      });
    }

    this.deviceSearchControl.valueChanges.pipe(this.untilDestroyed()).subscribe(() => {
      const deviceName = this.deviceSearchControl.value;

      if (deviceName) {
        this.detailsFacadeService.getDetails(deviceName);
      }
    });
  }

  onDynamicClick(): void {
    const deviceName = this.deviceSearchControl.value;

    if (deviceName) {
      this.router.navigate(['home', 'plugins', 'deviceinfo', 'dynamic', deviceName]);
    }
  }
}
