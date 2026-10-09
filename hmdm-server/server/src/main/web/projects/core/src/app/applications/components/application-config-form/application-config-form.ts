import { CommonModule } from '@angular/common';
import {
  Component,
  InputSignal,
  OutputEmitterRef,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { MatFormFieldModule, MatSelectModule, TOption, TranslatePipe, MatInput } from 'hmdm-ui-kit';
import { TAppConfigurationDTO } from '../../../entity/configuration/types/app-configuration-dto.type';
import { MatCheckbox } from '@angular/material/checkbox';

export type TConfigurationWithSelection = TAppConfigurationDTO & {
  selected?: boolean;
};

export enum EApplicationConfigAction {
  PROHIBIT = 0,
  INSTALL = 1,
  REMOVE = 2,
}

export interface TSimpleApplication {
  system: boolean;
  type: string;
  url?: string;
  urlArm64?: string;
  urlArmeabi?: string;
}

@Component({
  selector: 'core-application-config-form',
  templateUrl: './application-config-form.html',
  styleUrl: './application-config-form.scss',
  imports: [CommonModule, MatSelectModule, MatFormFieldModule, TranslatePipe, MatCheckbox],
})
export class ApplicationConfigForm {
  configurations: InputSignal<TConfigurationWithSelection[]> = input.required();
  application: InputSignal<TSimpleApplication | null> = input<TSimpleApplication | null>(null);

  configurationsChange: OutputEmitterRef<TConfigurationWithSelection[]> = output();
  bulkAction: OutputEmitterRef<{ action: number; selectedIds: number[] }> = output();

  selectAll = signal(false);
  groupAction = signal<number>(-1);

  selectedConfigurations = computed(() => {
    return this.configurations().filter((config) => config.selected);
  });

  selectedConfigurationIds = computed(() => {
    return this.selectedConfigurations().map((config) => config.configurationId);
  });

  availableActions = computed(() => {
    const app = this.application();

    if (!app) {
      return [
        {
          value: EApplicationConfigAction.INSTALL,
          viewValue: 'form.configuration.apps.action.install',
        },
        {
          value: EApplicationConfigAction.PROHIBIT,
          viewValue: 'form.configuration.apps.action.not.install',
        },
        {
          value: EApplicationConfigAction.REMOVE,
          viewValue: 'form.configuration.apps.action.delete',
        },
      ];
    }

    const isInstallable =
      !app.system && app.type === 'app' && (app.url || app.urlArm64 || app.urlArmeabi);
    const isRemovable = !app.system && app.type === 'app';

    const options: TOption<number>[] = [
      {
        value: EApplicationConfigAction.INSTALL,
        viewValue: isInstallable
          ? 'form.configuration.apps.action.install'
          : 'form.configuration.apps.action.permit',
      },
      {
        value: EApplicationConfigAction.PROHIBIT,
        viewValue: isInstallable
          ? 'form.configuration.apps.action.not.install'
          : 'form.configuration.apps.action.prohibit',
      },
    ];

    if (isRemovable) {
      options.push({
        value: EApplicationConfigAction.REMOVE,
        viewValue: 'form.configuration.apps.action.delete',
      });
    }

    return options;
  });

  groupActionOptions = computed(() => {
    return [
      { value: -1, viewValue: 'form.configuration.apps.action.select' },
      ...this.availableActions(),
    ];
  });

  onSelectAllChange(checked: boolean): void {
    this.selectAll.set(checked);

    const updatedConfigs = this.configurations().map((config) => ({
      ...config,
      selected: checked,
    }));

    this.configurationsChange.emit(updatedConfigs);
  }

  onConfigurationSelectionChange(configId: number, checked: boolean): void {
    console.log(checked, 'ab');

    const updatedConfigs = this.configurations().map((config) =>
      config.configurationId === configId ? { ...config, selected: checked } : config,
    );

    this.configurationsChange.emit(updatedConfigs);

    const allSelected = updatedConfigs.every((config) => config.selected);
    const noneSelected = updatedConfigs.every((config) => !config.selected);

    if (allSelected) {
      this.selectAll.set(true);
    } else if (noneSelected) {
      this.selectAll.set(false);
    }
  }

  onConfigurationActionChange(configId: number, action: number): void {
    console.log(action);

    const updatedConfigs = this.configurations().map((config) =>
      config.configurationId === configId
        ? {
            ...config,
            action,
            remove: action === EApplicationConfigAction.REMOVE,
            notify: true,
          }
        : config,
    );

    this.configurationsChange.emit(updatedConfigs);

    this.groupAction.set(-1);
  }

  onGroupActionChange(action: number): void {
    if (action === -1) return;

    const selectedIds = this.selectedConfigurationIds();
    if (selectedIds.length === 0) return;

    const updatedConfigs = this.configurations().map((config) =>
      config.selected
        ? {
            ...config,
            action,
            remove: action === EApplicationConfigAction.REMOVE,
            notify: true,
          }
        : config,
    );

    this.configurationsChange.emit(updatedConfigs);
    this.bulkAction.emit({ action, selectedIds });
  }
}
