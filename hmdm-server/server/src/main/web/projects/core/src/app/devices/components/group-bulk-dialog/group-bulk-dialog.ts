import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DialogBase, DialogTemplate, Selector, DialogCommonButtons } from 'hmdm-ui-kit';
import { GroupBulkFormConfig } from '../../configuration/group-bulk.form.config';
import { CONFIGURATION_BULK_OPTIONS } from '../../const/configuration-bulk-options';
import { DevicesFacadeService } from '../../services/devices-facade.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'core-group-bulk-dialog',
  templateUrl: './group-bulk-dialog.html',
  styleUrl: './group-bulk-dialog.scss',
  imports: [
    ReactiveFormsModule,
    DialogTemplate,
    Selector,
    MatButtonModule,
    TranslatePipe,
    DialogCommonButtons,
  ],
})
export class GroupBulkDialog extends DialogBase {
  private readonly devicesFacadeService = inject(DevicesFacadeService);
  private readonly groupBulkFormConfig: GroupBulkFormConfig = inject(GroupBulkFormConfig);

  groupOptions = this.devicesFacadeService.groups;
  formGroup = this.groupBulkFormConfig.getFormGroup();
  actionOptions = CONFIGURATION_BULK_OPTIONS;

  override onSave(): void {
    this.dialogRef.close(this.formGroup.value);
  }
}
