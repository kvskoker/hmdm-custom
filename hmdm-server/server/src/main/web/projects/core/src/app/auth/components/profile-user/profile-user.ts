import { Component, computed, effect, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '@ngx-translate/core';
import { MatButtonModule, TextInputComponent, Selector } from 'hmdm-ui-kit';
import { AuthService } from '../../../shared/services/auth.service';
import { SettingsFacadeService } from '../../../shared/services/settings-facade.service';
import { ProfileUserFormConfig } from '../../configuration/profile-user-form';
import { ProfileFacadeService } from '../../services/profile-facade.service';
import { ALERT_LEVEL_OPTIONS } from '../../../entity/user/constants/alert-level.constant';

@Component({
  selector: 'core-profile-user',
  templateUrl: './profile-user.html',
  styleUrl: './profile-user.scss',
  imports: [
    MatCardModule,
    TranslatePipe,
    TextInputComponent,
    MatButtonModule,
    ReactiveFormsModule,
    DatePipe,
    Selector,
  ],
})
export class ProfileUser implements OnInit {
  private readonly profileUserFormConfig = inject(ProfileUserFormConfig);
  private readonly profileFacadeService = inject(ProfileFacadeService);
  private readonly authService = inject(AuthService);
  private readonly settingsFacadeService = inject(SettingsFacadeService);

  formGroup = this.profileUserFormConfig.getFormGroup();

  readonly alertLevelOptions = ALERT_LEVEL_OPTIONS;

  readonly settings = this.settingsFacadeService.settings;
  readonly storageLimit = this.settingsFacadeService.storageLimit;

  readonly showAccountType = computed(() => {
    const s = this.settings();
    return !!s && !s.singleCustomer && s.accountType !== 3;
  });

  readonly accountTypeLabel = computed(() => {
    const s = this.settings();
    if (!s) return '';
    switch (s.accountType) {
      case 0:
        return 'customer.type.demo';
      case 1:
        return 'customer.type.small';
      case 2:
        return 'customer.type.corporate';
      default:
        return '';
    }
  });

  readonly isExpiryWarning = computed(() => {
    const s = this.settings();
    if (!s?.expiryTime) return false;
    return new Date(s.expiryTime).getTime() < Date.now() + 86400000 * 3;
  });

  readonly isDeviceLimitExceeded = computed(() => {
    const s = this.settings();
    return !!s && s.deviceLimit > 0 && s.deviceCount > s.deviceLimit;
  });

  readonly storageLimitDisplay = computed(() => {
    const limit = this.storageLimit();
    const s = this.settings();
    if (!limit || !s || s.sizeLimit <= 0) return null;
    return `${limit.sizeUsed} / ${limit.sizeLimit}`;
  });

  constructor() {
    effect(() => {
      const currentUser = this.authService.currentUser();

      if (!currentUser) {
        return;
      }

      this.formGroup.patchValue({
        login: currentUser.login,
        name: currentUser.name,
        email: currentUser.email,
        alertLevel: currentUser.alertLevel,
      });
    });
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().pipe(take(1)).subscribe();
    this.settingsFacadeService.fetchStorageLimit().subscribe();
  }

  onSave() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.profileFacadeService.updateProfile(this.formGroup.getRawValue());
  }
}
