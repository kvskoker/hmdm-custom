import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertContainer } from '../components/alert-container/alert-container';

@Injectable({
  providedIn: 'root',
})
export class SnackBarService {
  private snackBar: MatSnackBar = inject(MatSnackBar);

  error(message: string): void {
    this.open(message, 'error');
  }

  success(message: string): void {
    this.open(message, 'success');
  }

  info(message: string): void {
    this.open(message, 'info');
  }

  private open(message: string, type: 'error' | 'success' | 'info'): void {
    this.snackBar.openFromComponent(AlertContainer, {
      data: { message, type },
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
