import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import {
  DialogBase,
  DialogCommonButtons,
  DialogTemplate,
  Selector,
  TextInputComponent,
  TOption,
} from 'hmdm-ui-kit';
import { finalize, switchMap, take } from 'rxjs';
import { UserService } from '../../../entity/user/services/user.service';
import { TUserDTO } from '../../../entity/user/types/user-dto.type';
import { AuthService } from '../../../shared/services/auth.service';
import { SnackBarService } from '../../../shared/services/snack-bar.service';

@Component({
  selector: 'core-password-change-dialog',
  templateUrl: './password-change-dialog.html',
  styleUrl: './password-change-dialog.scss',
  imports: [
    DialogTemplate,
    DialogCommonButtons,
    ReactiveFormsModule,
    TextInputComponent,
    Selector,
    TranslatePipe,
  ],
})
export class PasswordChangeDialog extends DialogBase implements OnInit {
  readonly dialogData: { customerId: number; customerName: string } = inject(MAT_DIALOG_DATA);

  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly snackBarService = inject(SnackBarService);
  private readonly fb = inject(FormBuilder);

  users = signal<TUserDTO[]>([]);
  userOptions = signal<TOption<number>[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  formGroup: FormGroup = this.fb.group({
    userId: [null, Validators.required],
    newPassword: ['', Validators.required],
    confirm: ['', Validators.required],
  });

  ngOnInit(): void {
    this.userService
      .getUsersBySuperAdmin(this.dialogData.customerId)
      .pipe(take(1))
      .subscribe((users) => {
        this.users.set(users);
        this.userOptions.set(
          users.map((u) => ({
            value: u.id,
            viewValue: `${u.login}, ${u.name}`,
          })),
        );
      });
  }

  onSave(): void {
    this.errorMessage.set('');
    const { userId, newPassword, confirm } = this.formGroup.getRawValue();

    if (!userId) {
      this.errorMessage.set('error.empty.user');
      return;
    }
    if (!newPassword) {
      this.errorMessage.set('error.empty.password');
      return;
    }
    if (!confirm) {
      this.errorMessage.set('error.empty.password.confirm');
      return;
    }
    if (newPassword !== confirm) {
      this.errorMessage.set('error.mismatch.password');
      return;
    }

    this.isLoading.set(true);
    this.authService
      .preparePassword(newPassword)
      .pipe(
        switchMap((hashedPassword) =>
          this.userService.updatePasswordBySuperAdmin({ id: userId, newPassword: hashedPassword }),
        ),
        take(1),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.snackBarService.success('success.operation.completed');
          this.dialogRef.close();
        },
        error: () => {
          this.errorMessage.set('error.request.failure');
        },
      });
  }
}
