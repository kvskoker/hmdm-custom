import { effect, inject, Injectable, OnDestroy } from '@angular/core';
import { SettingsFacadeService } from './settings-facade.service';
import { TSettingsDTO } from '../../entity/settings/types/settings-dto.type';
import { AuthService } from './auth.service';
import { MatDialog } from '@angular/material/dialog';
import { fromEvent, merge, Subscription } from 'rxjs';
import { tap, throttleTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class IdleService implements OnDestroy {
  private readonly settingsFacadeService = inject(SettingsFacadeService);
  private readonly authService = inject(AuthService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private lastActivityTime: number = Date.now();
  private timeoutId: number | null = null;
  private activitySubscription: Subscription | null = null;

  constructor() {
    effect(() => {
      const settings = this.settingsFacadeService.settings();
      if (settings) {
        this.setupIdleLogout(settings);
      }
    });
  }

  init(): void {
    this.setupActivityListeners();

    const settings = this.settingsFacadeService.settings();

    if (settings) {
      this.setupIdleLogout(settings);
    }
  }

  clearTimeout(): void {
    if (this.timeoutId) {
      clearInterval(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private setupIdleLogout(settings: TSettingsDTO): void {
    const idleTimeout = settings.idleLogout * 1000; // Convert seconds to milliseconds
    console.log(`Setting up idle logout with timeout: ${idleTimeout} ms`);

    if (this.timeoutId) {
      clearInterval(this.timeoutId);
    }

    if (idleTimeout === 0) {
      return;
    }

    this.timeoutId = setInterval(() => {
      const currentTime = Date.now();
      const elapsed = currentTime - this.lastActivityTime;

      if (elapsed >= idleTimeout) {
        this.timeoutId && clearInterval(this.timeoutId);
        this.timeoutId = null;

        this.dialog.closeAll();
        this.authService.logout().subscribe();
      }
    }, 5 * 1000);
  }

  private setupActivityListeners(): void {
    // Listen to various user activity events
    const pageEvents = merge(
      fromEvent(document, 'mousemove'),
      fromEvent(document, 'mousedown'),
      fromEvent(document, 'keypress'),
      fromEvent(document, 'scroll'),
      fromEvent(document, 'touchstart'),
      fromEvent(document, 'click'),
    ).pipe(
      throttleTime(2000), // Throttle to once per 2 seconds to avoid excessive updates
    );

    this.activitySubscription = pageEvents.subscribe(() => {
      this.registerActivity();
    });
  }

  private registerActivity(): void {
    this.lastActivityTime = Date.now();
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearInterval(this.timeoutId);
    }
    if (this.activitySubscription) {
      this.activitySubscription.unsubscribe();
    }
  }
}
