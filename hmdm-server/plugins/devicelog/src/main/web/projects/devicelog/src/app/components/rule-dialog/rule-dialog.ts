import { Component, inject, OnInit } from '@angular/core';
import {
  DialogBase,
  DialogTemplate,
  MAT_DIALOG_DATA,
  MatButtonModule,
  MatDialog,
  TAutocompleteResponse,
  TranslatePipe,
} from 'hmdm-ui-kit';
import { filter, take } from 'rxjs';
import { RuleFormConfig } from '../../config/rules-form.config';
import { RuleDevicesDialog } from '../rule-devices-dialog/rule-devices-dialog';
import { RuleForm } from '../rule-form/rule-form';

@Component({
  selector: 'log-rule-dialog',
  templateUrl: './rule-dialog.html',
  styleUrl: './rule-dialog.scss',
  imports: [DialogTemplate, TranslatePipe, MatButtonModule, RuleForm],
})
export class RuleDialog extends DialogBase implements OnInit {
  private readonly matDialog = inject(MatDialog);
  private readonly ruleFormConfig = inject(RuleFormConfig);
  private readonly data = inject(MAT_DIALOG_DATA);

  private devices: TAutocompleteResponse[] = [];

  ruleFormGroup = this.ruleFormConfig.getFormGroup();

  ngOnInit(): void {
    console.log('RuleDialog data:', this.data);

    if (this.data) {
      this.ruleFormGroup.patchValue({
        name: this.data.name,
        active: this.data.active,
        severity: this.data.severity,
        filter: this.data.filter,
        applicationId: this.data.applicationPkg,
        configurationId: this.data.configurationName,
        groupId: this.data.groupName,
      });
      this.devices = this.data.devices || [];
    }
  }

  onDevicesDialog(): void {
    const dialogRef = this.matDialog.open(RuleDevicesDialog, {
      data: this.data?.devices || [],
      autoFocus: false,
    });

    dialogRef
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe((devices: TAutocompleteResponse[]) => {
        this.devices = devices;
      });
  }

  override onSave(): void {
    if (this.ruleFormGroup.invalid) {
      this.ruleFormGroup.markAllAsTouched();
      return;
    }

    const form = this.ruleFormGroup.getRawValue();
    this.dialogRef.close({
      ...this.ruleFormGroup.getRawValue(),
      devices: this.devices,
      configurationId:
        typeof form?.configurationId === 'number'
          ? Number(form?.configurationId)
          : this.data?.configurationId || null,
      applicationId:
        typeof form?.applicationId === 'number'
          ? Number(form?.applicationId)
          : this.data?.applicationId,
      groupId:
        typeof form?.groupId === 'number' ? Number(form?.groupId) : this.data?.groupId || null,
    });
  }
}
