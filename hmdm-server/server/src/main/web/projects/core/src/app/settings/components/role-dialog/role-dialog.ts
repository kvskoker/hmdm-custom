import { Component, inject, OnInit } from '@angular/core';
import { DialogBase, DialogCommonButtons, DialogTemplate, MAT_DIALOG_DATA } from 'hmdm-ui-kit';
import { RoleForm } from '../role-form/role-form';
import { RoleFormConfig } from '../../configuration/role-form.config';

@Component({
  selector: 'core-role-dialog',
  templateUrl: './role-dialog.html',
  styleUrl: './role-dialog.scss',
  imports: [DialogTemplate, RoleForm, DialogCommonButtons],
})
export class RoleDialog extends DialogBase implements OnInit {
  private readonly data = inject(MAT_DIALOG_DATA);
  private readonly roleFormConfig: RoleFormConfig = inject(RoleFormConfig);

  formGroup = this.roleFormConfig.getFormGroup();

  ngOnInit(): void {
    if (this.data?.role) {
      this.formGroup.patchValue({
        name: this.data.role.name,
        permissions: this.data.role.permissions.map((p: { id: number }) => p.id),
      });
    }
  }

  override onSave(): void {
    this.dialogRef.close(this.formGroup.value);
  }
}
