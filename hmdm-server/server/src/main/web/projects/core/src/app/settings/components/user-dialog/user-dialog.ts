import { Component, inject, OnInit } from '@angular/core';
import { DialogBase, DialogCommonButtons, DialogTemplate, MAT_DIALOG_DATA } from 'hmdm-ui-kit';
import { UserFormConfig } from '../../configuration/user-form.config';
import { UserForm } from '../user-form/user-form';

@Component({
  selector: 'core-user-dialog',
  templateUrl: './user-dialog.html',
  styleUrl: './user-dialog.scss',
  imports: [DialogTemplate, UserForm, DialogCommonButtons],
})
export class UserDialog extends DialogBase implements OnInit {
  private readonly data = inject(MAT_DIALOG_DATA);
  private readonly userFormConfig = inject(UserFormConfig);

  formGroup = this.userFormConfig.getFormGroup(!!this.data?.user);

  ngOnInit(): void {
    const user = this.data?.user;
    if (user) {
      this.formGroup.patchValue({
        login: user.login,
        email: user.email,
        name: user.name,
        allConfigAvailable: user.allConfigAvailable,
        allDevicesAvailable: user.allDevicesAvailable,
        configurations: user.configurations.map((c: { id: number }) => c.id),
        groups: user.groups.map((g: { id: number }) => g.id),
        userRole: user.userRole?.id || null,
        alertLevel: user.alertLevel,
      });
    }
  }

  override onSave(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.dialogRef.close(this.formGroup.value);
  }
}
