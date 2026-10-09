import { Component, HostListener, inject, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseComponent, MatButtonModule, TextInputComponent } from 'hmdm-ui-kit';
import { PasswordResetFormConfig } from '../../configuration/password-reset-form.config';
import { ResetPasswordFacadeService } from '../../services/reset-password-facade.service';
import { TPasswordResetForm } from '../../types/password-reset-form.type';

@Component({
  selector: 'core-reset-password',
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    TextInputComponent,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
})
export class ResetPassword extends BaseComponent implements OnInit {
  private readonly formConfig = inject(PasswordResetFormConfig);
  private readonly facade = inject(ResetPasswordFacadeService);
  private readonly route = inject(ActivatedRoute);

  formGroup: FormGroup<TPasswordResetForm> | null = null;
  isLoading = true;
  private token = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';

    this.formGroup?.controls.newPassword.valueChanges.pipe(this.untilDestroyed()).subscribe(() => {
      this.formGroup?.controls.confirm.updateValueAndValidity();
    });

    this.facade
      .loadSettings(this.token)
      .pipe(this.untilDestroyed())
      .subscribe({
        next: () => {
          this.formGroup = this.formConfig.getFormGroup();
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    event.preventDefault();
  }

  onSubmit(): void {
    if (!this.formGroup || this.formGroup.invalid) {
      this.formGroup?.markAllAsTouched();
      return;
    }

    const { newPassword } = this.formGroup.getRawValue();

    this.facade.reset(this.token, newPassword).pipe(this.untilDestroyed()).subscribe();
  }
}
