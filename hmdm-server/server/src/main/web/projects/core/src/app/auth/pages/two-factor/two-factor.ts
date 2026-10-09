import {Component, input, output, inject, OnDestroy, HostListener, computed, signal} from '@angular/core';
import {AuthService} from '../../../shared/services/auth.service';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {TextInputComponent} from 'hmdm-ui-kit';
import {TranslatePipe} from '@ngx-translate/core';
import {MatButton} from '@angular/material/button';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'core-two-factor',
  templateUrl: './two-factor.html',
  styleUrls: ['./two-factor.scss'],
  imports: [
    TextInputComponent,
    ReactiveFormsModule,
    TranslatePipe,
    MatButton
  ]
})
export class TwoFactor implements OnDestroy {
  private readonly authService = inject(AuthService);

  baseApiUrl = environment.baseApiUrl;

  isSetup = input(false);
  success = output<void>();
  cancel = output<void>();

  qrTimestamp = signal<number>(Date.now());
  readonly qrUrl = computed(() => {
    const id = this.authService.pendingUserId();
    return id ? `${this.baseApiUrl}rest/private/plugin-twofactor/qr/${id}?timestampMs=${this.qrTimestamp()}` : '';
  });

  public codeControl = new FormControl('',
    {
      nonNullable: true, validators: [
        Validators.required,
        Validators.pattern(/^\d{6}$/)
      ]
    }
  );

  @HostListener('window:beforeunload', ['$event'])
  clearSessionOnRefresh($event: any) {
    if (this.authService.getIs2FAPending()) {
      this.authService.logout().subscribe();
    }
  }

  onVerify() {
    if (!this.codeControl.value) return;

    this.authService.verifyTwoFactorCode(this.codeControl.value).subscribe((response) => {
      if (response.status === 'OK') {
        this.authService.getCurrentUser().subscribe(() => {
          this.success.emit();
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.authService.getIs2FAPending()) {
      this.authService.logout().subscribe();
    }
  }
}
