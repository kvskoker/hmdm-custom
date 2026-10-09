import { Component, computed, effect, inject, Signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BaseCellRenderer, Selector, TOption } from 'hmdm-ui-kit';
import { TApplicationDTO } from '../../../entity/application/types/application-dto.type';
import { APP_ACTION } from '../../const/app-action.const';
import { SHOW_ICON_OPTIONS } from '../../const/show-icon-options.const';
import { ConfigurationAppsFacadeService } from '../../services/configuration-applications-facade.service';

@Component({
  selector: 'core-apps-icon-cell',
  templateUrl: './apps-icon-cell.html',
  styleUrl: './apps-icon-cell.scss',
  imports: [Selector, ReactiveFormsModule],
})
export class AppsIconCell extends BaseCellRenderer<TApplicationDTO> {
  private readonly configurationAppsFacadeService = inject(ConfigurationAppsFacadeService);

  iconOptions: TOption<boolean>[] = SHOW_ICON_OPTIONS;
  formControl: FormControl<boolean> = new FormControl(true, { nonNullable: true });

  app: Signal<TApplicationDTO | null> = computed(() => this.params().data ?? null);
  isDisplayed: Signal<boolean> = computed(() => this.app()?.action === APP_ACTION.ALLOW);

  private readonly syncControlValue = effect(() => {
    const app = this.app();

    if (app) {
      this.formControl.setValue(app.showIcon, { emitEvent: false });
    }
  });

  constructor() {
    super();

    this.formControl.valueChanges.pipe(this.untilDestroyed()).subscribe((value) => {
      const app = this.app();

      if (app) {
        this.configurationAppsFacadeService.setAppIcon(app, value);
      }
    });
  }
}
