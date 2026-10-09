import { Component, inject, OnInit } from '@angular/core';
import { DialogBase, DialogCommonButtons, DialogTemplate, MAT_DIALOG_DATA } from 'hmdm-ui-kit';
import { GroupFormConfig } from '../../configuration/group-form.config';
import { GroupsForm } from '../groups-form/groups-form';

@Component({
  selector: 'core-groups-dialog',
  templateUrl: './groups-dialog.html',
  styleUrl: './groups-dialog.scss',
  imports: [DialogTemplate, DialogCommonButtons, GroupsForm],
})
export class GroupsDialog extends DialogBase implements OnInit {
  private readonly groupFormConfig = inject(GroupFormConfig);
  private readonly data = inject(MAT_DIALOG_DATA);

  formGroup = this.groupFormConfig.getFormGroup();

  ngOnInit(): void {
    if (this.data.group) {
      this.formGroup.patchValue(this.data.group);
    }
  }

  override onSave(): void {
    this.dialogRef.close(this.formGroup.getRawValue());
  }
}
