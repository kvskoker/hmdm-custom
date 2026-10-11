import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseComponent, Checkbox, Selector, TOption } from 'hmdm-ui-kit';
import { take } from 'rxjs';
import { DevicesFacadeService } from '../../../devices/services/devices-facade.service';
import { TDevicesSettingsDTO } from '../../../entity/settings/types/devices-settings-dto.type';
import { SettingsFacadeService } from '../../../shared/services/settings-facade.service';
import { DevicesSettingsFormConfig } from '../../configuration/devices-settings-form.config';
import { DEVICES_SETTING_COLUMNS } from '../../const/devices-setting-columns.const';
import { DevicesSettingsFacadeService } from '../../services/devices-settings-facade.service';
import { RoleService } from '../../../entity/role/services/role.service';

@Component({
  selector: 'core-devices-table',
  templateUrl: './devices-table.html',
  styleUrl: './devices-table.scss',
  imports: [MatCardModule, MatButtonModule, TranslatePipe, Selector, ReactiveFormsModule, Checkbox],
})
export class DevicesTable extends BaseComponent implements OnInit {
  private readonly devicesSettingsFormConfig = inject(DevicesSettingsFormConfig);
  private readonly settingsFacadeService = inject(SettingsFacadeService);
  private readonly roleService = inject(RoleService);
  private readonly devicesSettingsFacadeService = inject(DevicesSettingsFacadeService);
  private readonly devicesFacadeService = inject(DevicesFacadeService);

  private settingsData: TDevicesSettingsDTO | null = null;

  settings = this.settingsFacadeService.settings;
  formGroup = this.devicesSettingsFormConfig.getFormGroup();
  columns = DEVICES_SETTING_COLUMNS;
  roleOptions = signal<TOption<number>[]>([]);

  ngOnInit(): void {
    this.formGroup.controls.roleId.valueChanges.pipe(this.untilDestroyed()).subscribe(() => {
      const roleId = this.formGroup.controls.roleId.value;

      if (roleId) {
        this.loadSettingsByRole(roleId);
      }
    });

    // Table preferences need assignable roles, not global role-management access.
    this.roleService.getUserRoles().pipe(take(1), this.untilDestroyed()).subscribe((roles) => {
      const options = roles.map(role => ({ value: role.id, viewValue: role.name }));
      this.roleOptions.set(options);
      if (options.length > 0) this.initRole(options);
    });
  }

  onSave(): void {
    const formValue = this.formGroup.value;
    this.devicesSettingsFacadeService
      .updateDevicesSettings({
        ...this.settingsData!,
        ...formValue,
      })
      .pipe(take(1))
      .subscribe(() => {
        this.devicesFacadeService.fetchDeviceSettings();
      });
  }

  loadSettingsByRole(firstRoleId: number) {
    this.devicesSettingsFacadeService
      .getDevicesSettingsByRole(firstRoleId)
      .pipe(take(1))
      .subscribe((settings) => {
        this.settingsData = settings;
        this.formGroup.patchValue(settings, { emitEvent: false });
      });
  }

  private initRole(roles: TOption<number>[]) {
    const firstRoleId = roles[0].value;
    this.formGroup.patchValue({ roleId: firstRoleId }, { emitEvent: false });
    this.loadSettingsByRole(firstRoleId);
  }
}
