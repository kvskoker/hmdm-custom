import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  BaseComponent,
  MatButtonModule,
  TextAreaInputComponent,
  TextInputComponent,
} from 'hmdm-ui-kit';
import { finalize } from 'rxjs';
import { SignUpCompleteFormConfig } from '../../configuration/sign-up-complete-form.config';
import { SignUpFacadeService } from '../../services/sign-up-facade.service';
import { TSignUpCompleteForm } from '../../types/sign-up-complete-form.type';

@Component({
  selector: 'core-sign-up-complete',
  templateUrl: './sign-up-complete.html',
  styleUrl: './sign-up-complete.scss',
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    TextInputComponent,
    TextAreaInputComponent,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
})
export class SignUpComplete extends BaseComponent implements OnInit {
  private readonly formConfig = inject(SignUpCompleteFormConfig);
  private readonly facade = inject(SignUpFacadeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  formGroup: FormGroup<TSignUpCompleteForm> | null = null;
  isLoading = true;
  isSubmitting = false;
  isComplete = false;
  tokenValid = false;
  private token = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';

    this.facade.verifyToken(this.token).subscribe({
      next: (valid) => {
        this.tokenValid = valid;
        if (valid) {
          this.formGroup = this.formConfig.getFormGroup();
          this.formGroup.controls.newPassword.valueChanges
            .pipe(this.untilDestroyed())
            .subscribe(() => {
              this.formGroup?.controls.confirm.updateValueAndValidity();
            });
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  onSubmit(): void {
    if (!this.formGroup || this.formGroup.invalid) {
      this.formGroup?.markAllAsTouched();
      return;
    }

    const { customerId, firstName, lastName, company, description, newPassword } =
      this.formGroup.getRawValue();

    this.isSubmitting = true;
    this.facade
      .completeSignUp(
        this.token,
        customerId,
        firstName,
        lastName,
        company,
        description,
        newPassword,
      )
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        }),
        this.untilDestroyed(),
      )
      .subscribe({
        next: () => {
          this.isComplete = true;
        },
      });
  }

  onLogin(): void {
    this.router.navigate(['/auth/sign-in']);
  }

  onSignUp(): void {
    this.router.navigate(['/auth/sign-up']);
  }
}
