import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ChartConfiguration } from 'chart.js';
import { SummaryService } from '../../entity/summary/services/summary.service';
import { TSummaryResponse } from '../../entity/summary/types/summary-response.type';
import { arraySum } from '../../shared/utils/array-sum';

@Injectable({ providedIn: 'root' })
export class DashboardFacadeService {
  private summaryService = inject(SummaryService);
  private translateService = inject(TranslateService);

  private _enrollmentCircleData: WritableSignal<ChartConfiguration['data']> = signal({
    datasets: [],
  });
  private _enrollmentChartData: WritableSignal<ChartConfiguration['data']> = signal({
    datasets: [],
  });
  private _deviceCircleData: WritableSignal<ChartConfiguration['data']> = signal({ datasets: [] });
  private _deviceChartData: WritableSignal<ChartConfiguration['data']> = signal({ datasets: [] });
  private _applicationCircleData: WritableSignal<ChartConfiguration['data']> = signal({
    datasets: [],
  });
  private _applicationChartData: WritableSignal<ChartConfiguration['data']> = signal({
    datasets: [],
  });
  private _summary: WritableSignal<TSummaryResponse | null> = signal<TSummaryResponse | null>(null);

  enrollmentCircleData = this._enrollmentCircleData.asReadonly();
  enrollmentChartData = this._enrollmentChartData.asReadonly();
  deviceCircleData = this._deviceCircleData.asReadonly();
  deviceChartData = this._deviceChartData.asReadonly();
  applicationCircleData = this._applicationCircleData.asReadonly();
  applicationChartData = this._applicationChartData.asReadonly();
  summary = this._summary.asReadonly();

  constructor() {
    this.summaryService.getSummary().subscribe((summary) => {
      this.initEnrollmentCircleData(summary);
      this.initEnrollmentChartData(summary);
      this.initDeviceCircleData(summary);
      this.initDeviceChartData(summary);
      this.initApplicationCircleData(summary);
      this.initApplicationChartData(summary);
      this._summary.set(summary);
    });
  }

  private initEnrollmentCircleData(summary: TSummaryResponse): void {
    this._enrollmentCircleData.set({
      labels: [
        this.translateService.instant('summary.devices.enrolled.total'),
        this.translateService.instant('summary.devices.enrolled.earlier'),
      ],
      datasets: [
        {
          data: [summary.devicesEnrolled, summary.devicesEnrolledLastMonth],
          backgroundColor: ['#3b82f6', '#93c5fd'],
        },
      ],
    });
  }

  private initEnrollmentChartData(summary: TSummaryResponse): void {
    this._enrollmentChartData.set({
      labels: summary.deviceEnrolledMonthly?.map((item) => item.stringAttr),
      datasets: [
        {
          data: summary.deviceEnrolledMonthly?.map((item) => item.intAttr),
          backgroundColor: '#3b82f6',
        },
      ],
    });
  }

  private initDeviceCircleData(summary: TSummaryResponse): void {
    this._deviceCircleData.set({
      labels: [
        this.translateService.instant('summary.devices.active'),
        this.translateService.instant('summary.devices.offline'),
        this.translateService.instant('summary.devices.idle'),
      ],
      datasets: [
        {
          data: [
            arraySum(summary.statusOnlineByConfig),
            arraySum(summary.statusOfflineByConfig),
            arraySum(summary.statusIdleByConfig),
          ],
          backgroundColor: ['#3b82f6', '#ff6363', '#eab308'],
        },
      ],
    });
  }

  private initDeviceChartData(summary: TSummaryResponse): void {
    const datasets = [
      {
        label: this.translateService.instant('summary.devices.active'),
        data: summary.statusOnlineByConfig,
        backgroundColor: '#3b82f6',
      },
      {
        label: this.translateService.instant('summary.devices.offline'),
        data: summary.statusOfflineByConfig,
        backgroundColor: '#ff6363',
      },
      {
        label: this.translateService.instant('summary.devices.idle'),
        data: summary.statusIdleByConfig,
        backgroundColor: '#eab308',
      },
    ];

    this._deviceChartData.set({
      labels: summary.topConfigs,
      datasets: datasets,
    });
  }

  private initApplicationCircleData(summary: TSummaryResponse): void {
    this._applicationCircleData.set({
      labels: [
        this.translateService.instant('summary.devices.installation.failed'),
        this.translateService.instant('summary.devices.installation.mismatch'),
        this.translateService.instant('summary.devices.installation.completed'),
      ],
      datasets: [
        {
          data: [
            arraySum(summary.appFailureByConfig),
            arraySum(summary.appMismatchByConfig),
            arraySum(summary.appSuccessByConfig),
          ],
          backgroundColor: ['#ff6363', '#eab308', '#3b82f6'],
        },
      ],
    });
  }

  private initApplicationChartData(summary: TSummaryResponse): void {
    const datasets = [
      {
        label: this.translateService.instant('summary.devices.installation.failed'),
        data: summary.appFailureByConfig,
        backgroundColor: '#ff6363',
      },
      {
        label: this.translateService.instant('summary.devices.installation.mismatch'),
        data: summary.appMismatchByConfig,
        backgroundColor: '#eab308',
      },
      {
        label: this.translateService.instant('summary.devices.installation.completed'),
        data: summary.appSuccessByConfig,
        backgroundColor: '#3b82f6',
      },
    ];

    this._applicationChartData.set({
      labels: summary.topConfigs,
      datasets: datasets,
    });
  }
}
