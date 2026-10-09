import {Component, inject, OnInit} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {SnackBarService, TextAreaInputComponent} from 'hmdm-ui-kit';
import {LicenseService} from '../../services/license.service';
import {Router} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'core-license-dialog',
  imports: [
    MatButton,
    ReactiveFormsModule,
    TextAreaInputComponent,
    TranslatePipe
  ],
  templateUrl: './license-dialog.html',
  styleUrl: './license-dialog.scss',
})
export class LicenseDialog implements OnInit {
  private readonly licenseService = inject(LicenseService);
  private readonly router = inject(Router);
  private readonly snackbar = inject(SnackBarService);

  pluginLicenseKeyData = this.licenseService.pluginLicenseKeyData;
  licenseKeyControl: FormControl<string> = new FormControl('', {nonNullable: true});

  ngOnInit(): void {
    const licenseData = this.pluginLicenseKeyData();
    if (licenseData === null || (licenseData?.valid && licenseData?.expiryDays > 7)) {
      this.router.navigate(['/auth']);
    }
  }

  submit() {
    this.licenseService.putPluginLicenseKey(this.licenseKeyControl.value).subscribe({
      next: (value) => {
        if (value.valid) {
          this.router.navigate(['/auth']);
        } else {
          this.snackbar.error('missing.license.alert');
        }
      },
      error: (error) => {
        this.snackbar.error('missing.license.alert');
      }
    });
  }

  cancel() {
    this.router.navigate(['/auth']);
  }
}
