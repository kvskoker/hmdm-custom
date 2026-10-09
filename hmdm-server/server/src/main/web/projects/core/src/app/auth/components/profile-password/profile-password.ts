import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '@ngx-translate/core';
import { MatButtonModule, TextInputComponent } from 'hmdm-ui-kit';
import { ProfilePasswordFormConfig } from '../../configuration/profile-password-form';
import { ProfileFacadeService } from '../../services/profile-facade.service';

@Component({
  selector: 'core-profile-password',
  templateUrl: './profile-password.html',
  styleUrl: './profile-password.scss',
  imports: [MatCardModule, TranslatePipe, TextInputComponent, ReactiveFormsModule, MatButtonModule],
})
export class ProfilePassword {
  private readonly profilePasswordFormConfig = inject(ProfilePasswordFormConfig);
  private readonly profileFacadeService = inject(ProfileFacadeService);

  formGroup = this.profilePasswordFormConfig.getFormGroup();

  onSave(): void {
    console.log('onSave called');

    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.profileFacadeService.changePassword(this.formGroup.getRawValue());
  }
}
