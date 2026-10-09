import { inject, Injectable } from '@angular/core';
import { filter, map, Observable, switchMap, tap } from 'rxjs';
import { AuthService } from '../../shared/services/auth.service';
import { SignupService } from '../../shared/services/signup.service';
import { SnackBarService } from '../../shared/services/snack-bar.service';

@Injectable({
  providedIn: 'root',
})
export class SignUpFacadeService {
  private readonly signupService = inject(SignupService);
  private readonly authService = inject(AuthService);
  private readonly snackBarService = inject(SnackBarService);

  signUp(email: string): Observable<void> {
    const language = navigator.language.substring(0, 2);

    return this.signupService.verifyEmail({ email, language }).pipe(
      tap((response) => {
        if (response.status === 'ERROR') {
          this.snackBarService.error('signup.email.used');
        }
      }),
      filter((response) => response.status === 'OK'),
      map(() => void 0),
    );
  }

  verifyToken(token: string): Observable<boolean> {
    return this.signupService.verifyToken(token).pipe(map((response) => response.status === 'OK'));
  }

  completeSignUp(
    token: string,
    customerId: string,
    firstName: string,
    lastName: string,
    company: string,
    description: string,
    password: string,
  ): Observable<void> {
    return this.authService.preparePassword(password).pipe(
      switchMap((hashedPassword) =>
        this.signupService.complete({
          token,
          name: customerId,
          firstName,
          lastName,
          company,
          description,
          passwd: hashedPassword,
        }),
      ),
      tap((response) => {
        if (response.status === 'ERROR') {
          this.snackBarService.error('signup.name.used');
        }
      }),
      filter((response) => response.status === 'OK'),
      map(() => void 0),
    );
  }
}
