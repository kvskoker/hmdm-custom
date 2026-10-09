import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  isAuthenticated = new ReplaySubject<boolean>(1);
  pendingPasswordReset = new BehaviorSubject<{ token: string } | null>(null);
}
