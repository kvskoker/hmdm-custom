import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseComponent, MatButtonModule, TextInputComponent } from 'hmdm-ui-kit';
import { finalize } from 'rxjs';
import { SignUpFormConfig } from '../../configuration/sign-up-form.config';
import { SignUpFacadeService } from '../../services/sign-up-facade.service';
import { TSignUpForm } from '../../types/sign-up-form.type';

@Component({
  selector: 'core-sign-up',
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss',
  imports: [TextInputComponent, RouterLink, ReactiveFormsModule, TranslatePipe, MatButtonModule],
})
export class SignUp extends BaseComponent implements OnInit {
  private readonly formConfig = inject(SignUpFormConfig);
  private readonly facade = inject(SignUpFacadeService);

  formGroup: FormGroup<TSignUpForm> | null = null;
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

    const { email } = this.formGroup.getRawValue();

    this.isLoading = true;
    this.facade
      .signUp(email)
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
