import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../shared/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ForgotPasswordFacadeService {
  private readonly authService = inject(AuthService);

  recover(login: string): Observable<void> {
    return this.authService.recoverPassword(login);
  }
}
