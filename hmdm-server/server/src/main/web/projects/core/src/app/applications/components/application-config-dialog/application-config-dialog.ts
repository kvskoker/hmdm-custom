import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import {
  DialogBase,
  DialogCommonButtons,
  DialogTemplate,
  MAT_DIALOG_DATA,
  MatButtonModule,
  TranslatePipe,
} from 'hmdm-ui-kit';
import { ApplicationService } from '../../../entity/application/services/application.service';
import { TApplicationDTO } from '../../../entity/application/types/application-dto.type';
import { TAppConfigurationDTO } from '../../../entity/configuration/types/app-configuration-dto.type';
import { ApplicationConfigFacadeService } from '../../services/application-config-facade.service';
import {
  ApplicationConfigForm,
  TConfigurationWithSelection,
} from '../application-config-form/application-config-form';
interface DialogData {
  applicationId?: number;
  versionId?: number;
}

@Component({
  selector: 'core-application-config-dialog',
  templateUrl: './application-config-dialog.html',
  styleUrl: './application-config-dialog.scss',
  providers: [ApplicationConfigFacadeService],
  imports: [
    DialogTemplate,
    TranslatePipe,
    MatButtonModule,
    ApplicationConfigForm,
    CommonModule,
    DialogCommonButtons,
  ],
})
export class ApplicationConfigDialog extends DialogBase implements OnInit {
  private readonly applicationConfigFacadeService = inject(ApplicationConfigFacadeService);
  private readonly applicationService = inject(ApplicationService);
  private readonly data = inject(MAT_DIALOG_DATA) as DialogData;

  configurations = this.applicationConfigFacadeService.configurations;
  saving = this.applicationConfigFacadeService.saving;

  application = signal<TApplicationDTO | null>(null);
  localConfigurations = signal<TConfigurationWithSelection[]>([]);
  private isInitialized = signal(false);

  applicationDisplayName = computed(() => {
    const app = this.application();
    return app ? `${app.name} (${app.version || 'Unknown'})` : '';
  });

  simpleApplication = computed(() => {
    const app = this.application();
    if (!app) return null;

    return {
      system: app.system || false,
      type: app.type,
      url: app.url || undefined,
      urlArm64: app.urlArm64 || undefined,
      urlArmeabi: app.urlArmeabi || undefined,
    };
  });

  constructor() {
    super();
    effect(() => {
      const configs = this.configurations();
      if (configs.length > 0 && !this.isInitialized()) {
        const configsWithSelection = configs.map((config) => ({
          ...config,
          selected: false,
        }));
        this.localConfigurations.set(configsWithSelection);
        this.isInitialized.set(true);
      }
    });
  }

  ngOnInit(): void {
    const applicationId = this.data.applicationId;
    const versionId = this.data.versionId;

    if (applicationId) {
      this.applicationService.getApplication(applicationId).subscribe({
        next: (app) => {
          if (app) {
            this.application.set(app);
          }

          this.applicationConfigFacadeService.initApplicationConfigurations(applicationId);
        },
        error: (error: any) => {
          console.error('Failed to load application:', error);
        },
      });
    } else if (versionId) {
      // If we're here, app is type.APP and not system, so just init the rest
      this.applicationConfigFacadeService.initVersionConfigurations(versionId);
    }
  }

  onConfigurationsChange(updatedConfigs: TConfigurationWithSelection[]): void {
    this.localConfigurations.set(updatedConfigs);
  }

  onBulkAction(event: { action: number; selectedIds: number[] }): void {
    const updatedConfigs = this.localConfigurations().map((config) =>
      event.selectedIds.includes(config.configurationId)
        ? {
            ...config,
            action: event.action,
            remove: event.action === 2,
            notify: true,
          }
        : config,
    );
    this.localConfigurations.set(updatedConfigs);
  }

  override onSave(): void {
    const finalConfigs = this.localConfigurations().map((config) => {
      const { selected, ...configWithoutSelection } = config;
      return configWithoutSelection as TAppConfigurationDTO;
    });

    this.applicationConfigFacadeService.updateAllConfigurations(finalConfigs);

    // Same branching as in ngOnInit: links are loaded and saved either per application or per version
    const save$ = this.data.applicationId
      ? this.applicationConfigFacadeService.saveConfigurations(this.data.applicationId)
      : this.applicationConfigFacadeService.saveVersionConfigurations(this.data.versionId!);

    // Close only after the backend has saved the links, so the table refresh
    // triggered on close sees the updated deletionProhibited flag
    save$.subscribe({
      next: () => this.dialogRef.close(true),
    });
  }
}
