import {Component, inject, OnInit, signal, WritableSignal} from '@angular/core';
import {BaseComponent, LoaderDirective, SearchContainer} from 'hmdm-ui-kit';
import {FormControl} from '@angular/forms';
import {AlertsConfigFacadeService} from '../../services/alerts-config-facade.service';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatDivider} from '@angular/material/divider';
import {TranslatePipe} from '@ngx-translate/core';
import {AlertsTable} from '../../components/alerts-table/alerts-table';
import {AlertsForm} from '../../components/alerts-form/alerts-form';
import {AlertsFormConfig} from '../../configuration/alerts-form.config';
import {TAlertBodyDTO} from '../../../entity/alert/types/alert-body-dto.type';
import {debounceTime, distinctUntilChanged, skip} from 'rxjs';
import {PageEvent} from '@angular/material/paginator';

@Component({
  selector: 'core-alerts',
  imports: [
    MatCard,
    MatCardTitle,
    SearchContainer,
    MatCardContent,
    TranslatePipe,
    LoaderDirective,
    MatDivider,
    AlertsTable,
    AlertsForm
  ],
  templateUrl: './alerts.html',
  styleUrl: './alerts.scss',
})
export class Alerts extends BaseComponent implements OnInit {
  private readonly alertsService = inject(AlertsConfigFacadeService);
  private readonly alertsFormConfig = inject(AlertsFormConfig);

  isAlertsLoading = this.alertsService.isAlertsLoading;
  activeFiltersCnt: WritableSignal<number> = signal<number>(0);

  alertsFormGroup = this.alertsFormConfig.getFormGroup();
  alertSearchControl = new FormControl<string>('');

  ngOnInit(): void {
    this.alertsService.clearState();
    this.searchAlerts();

    this.activeFiltersCnt.set(
      Object.values(this.alertsFormGroup.getRawValue()).filter((value) =>
        Boolean(value) || value === 0).length,
    );

    this.alertsFormGroup.valueChanges.pipe(this.untilDestroyed()).subscribe(() => {
      this.activeFiltersCnt.set(
        Object.values(this.alertsFormGroup.getRawValue()).filter((value) =>
          Boolean(value) || value === 0).length,
      );
    });

    this.alertSearchControl.valueChanges.pipe(
      skip(1), this.untilDestroyed(), debounceTime(500), distinctUntilChanged()
    ).subscribe(() => {
      this.searchAlerts();
    })
  }

  pageChanged(e: PageEvent) {
    const formValues = this.alertsFormGroup.value;
    this.searchAlerts({
      messageFilter: this.alertSearchControl.value || '',
      pageSize: e.pageSize,
      pageNum: e.pageIndex + 1,
      deviceFilter: formValues.deviceFilter || null,
      dateFrom: formValues.date?.start ? formValues.date.start.getTime() : null,
      dateTo: formValues.date?.end ? formValues.date.end.getTime() : null,
      severity: formValues.severity || 10,
      sortValue: 'createTime',
      export: false
    });
  }

  searchAlerts(body: TAlertBodyDTO | null = null) {
    let preparedBody: TAlertBodyDTO;
    if (body) {
      preparedBody = body;
    } else {
      const formValues = this.alertsFormGroup.value;
      preparedBody = {
        messageFilter: this.alertSearchControl.value || '',
        pageSize: 10,
        pageNum: 1,
        deviceFilter: formValues.deviceFilter || null,
        dateFrom: formValues.date?.start ? formValues.date.start.getTime() : null,
        dateTo: formValues.date?.end ? formValues.date.end.getTime() : null,
        severity: formValues.severity || 10,
        sortValue: 'createTime',
        export: false
      }
    }

    this.alertsService.getAlerts(preparedBody);
  }
}
