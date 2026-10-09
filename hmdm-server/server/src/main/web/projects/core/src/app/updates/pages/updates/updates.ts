import { Component, OnInit, inject, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule, NonNullableFormBuilder} from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {TAppUpdate, TUpdateForm} from '../../types/updates.types';
import {UpdatesService} from '../../services/updates.service';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatCardModule} from '@angular/material/card';
import {MatDivider} from '@angular/material/divider';
import {LoaderDirective} from 'hmdm-ui-kit';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'core-updates',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDivider,
    LoaderDirective,
    MatCheckbox,
    MatIcon,
    MatButton
  ],
  templateUrl: './updates.html',
  styleUrls: ['./updates.scss']
})
export class Updates implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private updatesService = inject(UpdatesService);
  private translate = inject(TranslateService);

  readonly APP_VERSION = '5.39.3';

  errorMessage = signal<string>('');
  completeMessage = signal<string>('');
  isChecking = signal<boolean>(true);
  isUpdating = signal<boolean>(false);
  isError = signal<boolean>(false);
  updates = signal<TAppUpdate[]>([]);

  updateForm = this.fb.group({
    update: false,
    sendStats: true,
    updates: []
  } as TUpdateForm);

  ngOnInit(): void {
    this.completeMessage.set(this.translate.instant('updates.checking'));
    this.checkUpdates();
  }

  private checkUpdates(): void {
    this.updatesService.checkUpdates().subscribe({
      next: (response) => {
        this.isChecking.set(false);
        this.completeMessage.set('');

        if (response.status === 'OK') {
          this.updates.set(this.processAppsData(response.data));
        } else if (response.status === 'ERROR') {
          this.isError.set(true);
          this.errorMessage.set(this.translate.instant('errors.server_error'));
        }
      },
      error: () => {
        this.isChecking.set(false);
        this.isError.set(true);
        this.errorMessage.set(this.translate.instant('errors.connection_failed'));
      }
    });
  }

  getUpdates(): void {
    this.completeMessage.set(this.translate.instant('updates.getting'));
    this.isUpdating.set(true);

    this.updateForm.patchValue({ updates: this.updates() });

    this.updatesService.getUpdates({
      update: this.updateForm.value.update!,
      sendStats: this.updateForm.value.sendStats!,
      updates: this.updateForm.value.updates!
    }).subscribe({
      next: (response) => {
        this.isUpdating.set(false);
        this.completeMessage.set(this.translate.instant('updates.success'));

        if (response.status === 'OK') {
          this.updates.set(this.processAppsData(response.data));
        } else if (response.status === 'ERROR') {
          this.errorMessage.set(this.translate.instant('errors.server_error'));
        }
      },
      error: () => {
        this.isUpdating.set(false);
        this.errorMessage.set(this.translate.instant('errors.action_failed'));
      }
    });
  }

  private processAppsData(apps: TAppUpdate[]): TAppUpdate[] {
    return apps.map((app) => {
      const copy = { ...app };

      if (copy.pkg === 'web') {
        copy.currentVersion = this.APP_VERSION;
      }

      const current = copy.currentVersion || '0.0.0';
      const available = copy.version || '0.0.0';

      copy.outdated = this.compareVersions(current, available) < 0;

      if (copy.updateDisabled && copy.updateDisableReason) {
        copy.updateDisableReasonLocalized = this.translate.instant(`updates.disabled.${copy.updateDisableReason}`);
      }

      return copy;
    });
  }

  private compareVersions(v1: string, v2: string): number {
    const a = v1.split('.').map(Number);
    const b = v2.split('.').map(Number);
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      const numA = a[i] || 0;
      const numB = b[i] || 0;
      if (numA < numB) return -1;
      if (numA > numB) return 1;
    }
    return 0;
  }
}
