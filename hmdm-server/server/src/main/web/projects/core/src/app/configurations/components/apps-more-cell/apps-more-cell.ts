import { Component, computed, inject, Signal } from '@angular/core';
import { BaseCellRenderer, MatButtonModule, MatIconModule } from 'hmdm-ui-kit';
import { TApplicationDTO } from '../../../entity/application/types/application-dto.type';
import { APP_ACTION } from '../../const/app-action.const';
import { ConfigurationApplicationDialogService } from '../../services/configuration-application-dialog.service';

@Component({
  selector: 'core-apps-more-cell',
  templateUrl: './apps-more-cell.html',
  styleUrl: './apps-more-cell.scss',
  imports: [MatButtonModule, MatIconModule],
})
export class AppsMoreCell extends BaseCellRenderer<TApplicationDTO> {
  private readonly configurationApplicationDialogService = inject(
    ConfigurationApplicationDialogService,
  );

  isDisplayed: Signal<boolean> = computed(() => this.params().data?.action === APP_ACTION.ALLOW);

  openApplicationDialog(): void {
    const app = this.params().data;
    this.configurationApplicationDialogService.openEditDialog(app);
  }
}
