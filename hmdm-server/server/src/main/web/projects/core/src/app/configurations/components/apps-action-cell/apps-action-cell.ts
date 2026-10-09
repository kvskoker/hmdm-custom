import { Component, computed, effect, inject, Signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BaseCellRenderer, Selector, TOption } from 'hmdm-ui-kit';
import { TApplicationDTO } from '../../../entity/application/types/application-dto.type';
import { ConfigurationAppsFacadeService } from '../../services/configuration-applications-facade.service';

@Component({
  selector: 'core-apps-action-cell',
  templateUrl: './apps-action-cell.html',
  styleUrl: './apps-action-cell.scss',
  imports: [Selector, ReactiveFormsModule],
})
export class AppsActionCell extends BaseCellRenderer<TApplicationDTO> {
  private readonly configurationAppsFacadeService = inject(ConfigurationAppsFacadeService);

  app: Signal<TApplicationDTO> = computed(() => this.params().data);
  actionOptions: Signal<TOption<number>[]> = computed(() =>
    this.configurationAppsFacadeService.getActionOptions(this.app()),
  );
  formControl: FormControl<number> = new FormControl(1, { nonNullable: true });

  private readonly syncControlValue = effect(() => {
    this.formControl.setValue(this.app().action, { emitEvent: false });
  });

  constructor() {
    super();

    this.formControl.valueChanges.pipe(this.untilDestroyed()).subscribe((value) => {
      this.configurationAppsFacadeService.setAppAction(this.app(), value);
    });
  }
}
