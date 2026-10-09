import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {AlertService} from '../../entity/alert/services/alert.service';
import {TAlertDTO} from '../../entity/alert/types/alert-dto.type';
import {finalize, take} from 'rxjs';
import {TAlertBodyDTO} from '../../entity/alert/types/alert-body-dto.type';

@Injectable({providedIn: 'root'})
export class AlertsConfigFacadeService {
  private readonly alertService = inject(AlertService);
  private _isAlertsLoading: WritableSignal<boolean> = signal(false);
  isAlertsLoading = this._isAlertsLoading.asReadonly();
  private _alerts: WritableSignal<TAlertDTO[]> = signal([]);
  alerts = this._alerts.asReadonly();
  private _totalAlerts: WritableSignal<number> = signal(0);
  totalAlerts = this._totalAlerts.asReadonly();

  getAlerts(body: TAlertBodyDTO) {
    this._isAlertsLoading.set(true);

    this.alertService.getAlertsHttp(body)
      .pipe(
        take(1),
        finalize(() => this._isAlertsLoading.set(false)),
      )
      .subscribe({
        next: (res) => {
          this._alerts.set(res.items);
          this._totalAlerts.set(res.totalItemsCount);
        }
      })
  }

  clearState(): void {
    this._alerts.set([]);
    this._totalAlerts.set(0);
  }
}
