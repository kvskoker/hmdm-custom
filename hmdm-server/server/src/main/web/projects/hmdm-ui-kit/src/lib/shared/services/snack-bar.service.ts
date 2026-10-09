import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertContainer } from '../components/alert-container/alert-container';

@Injectable({
  providedIn: 'root',
})
export class SnackBarService {
  private snackBar: MatSnackBar = inject(MatSnackBar);

  error(message: string, params?: Record<string, unknown>): void {
    this.open(message, 'error', params);
  }

  success(message: string, params?: Record<string, unknown>): void {
    this.open(message, 'success', params);
  }

  info(message: string, params?: Record<string, unknown>): void {
    this.open(message, 'info', params);
  }

  warning(message: string, params?: Record<string, unknown>): void {
    this.open(message, 'warning', params);
  }

  private open(
    message: string,
    type: 'error' | 'success' | 'info' | 'warning',
    params?: Record<string, unknown>,
  ): void {
    this.snackBar.openFromComponent(AlertContainer, {
      data: { message, type, params },
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
