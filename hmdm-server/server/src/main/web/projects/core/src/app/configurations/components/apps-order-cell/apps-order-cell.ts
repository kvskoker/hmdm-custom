import { Component, inject, OnInit } from '@angular/core';
import { BaseCellRenderer, TextInputComponent } from 'hmdm-ui-kit';
import { TApplicationDTO } from '../../../entity/application/types/application-dto.type';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { APP_ACTION } from '../../const/app-action.const';
import { ConfigurationAppsFacadeService } from '../../services/configuration-applications-facade.service';

function toScreenOrder(value: string | null): number | null {
  const parsed = Number(value);

  return !value || Number.isNaN(parsed) ? null : parsed;
}

@Component({
  selector: 'core-apps-order-cell',
  templateUrl: './apps-order-cell.html',
  styleUrl: './apps-order-cell.scss',
  imports: [TextInputComponent, ReactiveFormsModule],
})
export class AppsOrderCell extends BaseCellRenderer<TApplicationDTO> implements OnInit {
  private readonly configurationAppsFacadeService = inject(ConfigurationAppsFacadeService);

  formControl: FormControl<string | null> = new FormControl(null);

  ngOnInit(): void {
    const app = this.params().data;

    this.formControl.setValue(app.screenOrder?.toString() ?? null, { emitEvent: false });

    this.formControl.valueChanges.pipe(this.untilDestroyed()).subscribe((value) => {
      this.configurationAppsFacadeService.setAppOrder(app, toScreenOrder(value));
    });
  }

  isDisplayed(): boolean {
    const app = this.params().data;

    return app.action === APP_ACTION.ALLOW && app.showIcon;
  }
}
