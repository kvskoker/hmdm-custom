import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseComponent, MatButtonModule, TextInputComponent } from 'hmdm-ui-kit';
import { finalize } from 'rxjs';
import { ForgotPasswordFormConfig } from '../../configuration/forgot-password-form.config';
import { ForgotPasswordFacadeService } from '../../services/forgot-password-facade.service';
import { TForgotPasswordForm } from '../../types/forgot-password-form.type';

@Component({
  selector: 'core-forgot-password',
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
  imports: [ReactiveFormsModule, TranslatePipe, TextInputComponent, MatButtonModule, RouterLink],
})
export class ForgotPassword extends BaseComponent implements OnInit {
  private readonly formConfig = inject(ForgotPasswordFormConfig);
  private readonly facade = inject(ForgotPasswordFacadeService);

  formGroup: FormGroup<TForgotPasswordForm> | null = null;
  isSuccess = false;
  isLoading = false;

  ngOnInit(): void {
    this.formGroup = this.formConfig.getFormGroup();
  }

  onSubmit(): void {
    if (!this.formGroup || this.formGroup.invalid) {
      this.formGroup?.markAllAsTouched();
      return;
    }

    const { login } = this.formGroup.getRawValue();

    this.isLoading = true;
    this.facade
      .recover(login)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
        this.untilDestroyed(),
      )
      .subscribe({
        next: () => {
          this.isSuccess = true;
        },
      });
  }
}
