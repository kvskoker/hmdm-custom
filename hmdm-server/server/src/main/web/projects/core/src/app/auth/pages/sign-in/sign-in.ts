import { Component, inject, OnInit, Signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {MatAnchor, MatButton} from '@angular/material/button';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BaseComponent, RebrandingService, TextInputComponent, TranslatePipe } from 'hmdm-ui-kit';
import { TAuthConfig } from '../../../shared/types/auth-config.type';
import { AuthService } from '../../../shared/services/auth.service';
import { SignInFormConfig } from '../../configuration/sign-in-form.config';
import {TwoFactor} from '../two-factor/two-factor';

@Component({
  selector: 'core-sign-in',
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
  imports: [TextInputComponent, RouterLink, MatAnchor, ReactiveFormsModule, TranslatePipe, TwoFactor, MatButton],
})
export class SignIn extends BaseComponent implements OnInit {
  private readonly formConfig: SignInFormConfig = inject(SignInFormConfig);
  private readonly authService: AuthService = inject(AuthService);
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly rebrandingService = inject(RebrandingService);

  readonly rebranding = this.rebrandingService.rebranding;
  formGroup = this.formConfig.getFormGroup();
  authOptions: Signal<TAuthConfig | null> = this.authService.authOptions;
  public showTwoFactorInput = false;
  public isSetupFlow = false;

  ngOnInit(): void {
    this.authService.loadAuthOptions().pipe(this.untilDestroyed()).subscribe();
  }

  onSignIn() {
    if (this.formGroup.invalid) return;

    this.authService.signIn(this.formGroup.getRawValue()).subscribe((result) => {
      if (!result) return;

      if (result.flow === 'DIRECT') {
        this.navigateToHome();
      } else {
        this.isSetupFlow = (result.flow === 'SETUP');
        this.showTwoFactorInput = true;
      }
    });
  }

  onTwoFactorSuccess() {
    this.navigateToHome();
  }

  private navigateToHome() {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    const safeReturnUrl = returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/home';
    this.router.navigateByUrl(safeReturnUrl);
  }
}
