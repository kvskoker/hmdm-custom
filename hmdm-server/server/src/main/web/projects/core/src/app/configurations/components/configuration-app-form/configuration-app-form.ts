import {
  Component,
  inject,
  input,
  InputSignal,
  OnInit,
  output,
  OutputEmitterRef,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BaseComponent, Selector, SelectSearch, TOption, TranslatePipe } from 'hmdm-ui-kit';
import { TApplicationDTO } from '../../../entity/application/types/application-dto.type';
import { ConfigurationAppFormConfig } from '../../configs/configuration-app-form.config';
import { SHOW_ICON_OPTIONS } from '../../const/show-icon-options.const';
import { ConfigurationAppsFacadeService } from '../../services/configuration-applications-facade.service';
import { TConfigurationAppDetailsForm } from '../../types/configuration-app-details-form.type';

@Component({
  selector: 'core-configuration-app-form',
  templateUrl: './configuration-app-form.html',
  styleUrl: './configuration-app-form.scss',
  imports: [ReactiveFormsModule, Selector, TranslatePipe, SelectSearch],
})
export class ConfigurationAppForm extends BaseComponent implements OnInit {
  formChange: OutputEmitterRef<TApplicationDTO> = output();

  private readonly configurationAppFormConfig = inject(ConfigurationAppFormConfig);
  private readonly configurationAppFacadeService = inject(ConfigurationAppsFacadeService);

  private selectedApp: TApplicationDTO | null = null;

  applicationsOptions = this.configurationAppFacadeService.applicationsOptions;

  appFormControl: FormControl<TApplicationDTO | null> = new FormControl(null);
  actionFormControl: FormControl<number | null> = new FormControl(null);
  iconFormControl: FormControl<boolean | null> = new FormControl(null);

  actionOptions: WritableSignal<TOption<number>[]> = signal([]);
  iconOptions = SHOW_ICON_OPTIONS;

  ngOnInit(): void {
    this.actionFormControl.disable();
    this.iconFormControl.disable();

    this.appFormControl.valueChanges.pipe(this.untilDestroyed()).subscribe(() => {
      this.selectedApp = this.appFormControl.value;

      if (this.selectedApp) {
        this.actionFormControl.enable();
        this.iconFormControl.enable();

        console.log(this.selectedApp);

        this.actionFormControl.setValue(1);
        this.iconFormControl.setValue(this.selectedApp.showIcon);
        this.actionOptions.set(
          this.configurationAppFacadeService.getActionOptions(this.selectedApp),
        );

        this.formChange.emit(this.selectedApp);
      }
    });

    this.actionFormControl.valueChanges.pipe(this.untilDestroyed()).subscribe(() => {
      const value = this.actionFormControl.value;
      if (value !== null && this.selectedApp) {
        this.selectedApp.action = value;
        this.formChange.emit(this.selectedApp);
      }
    });

    this.iconFormControl.valueChanges.pipe(this.untilDestroyed()).subscribe(() => {
      const value = this.iconFormControl.value;
      if (value !== null && this.selectedApp) {
        this.selectedApp.showIcon = value;
        this.formChange.emit(this.selectedApp);
      }
    });
  }
}
