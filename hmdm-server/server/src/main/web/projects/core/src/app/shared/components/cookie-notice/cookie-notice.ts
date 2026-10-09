import { Component, computed, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { RebrandingService, TranslatePipe } from 'hmdm-ui-kit';

@Component({
  selector: 'core-cookie-notice',
  templateUrl: './cookie-notice.html',
  styleUrl: './cookie-notice.scss',
  imports: [MatButton, RouterLink, TranslatePipe],
})
export class CookieNotice {
  private readonly rebrandingService = inject(RebrandingService);

  private readonly STORAGE_KEY = 'cookieNoticeDismissed';

  readonly dismissed = signal(localStorage.getItem(this.STORAGE_KEY) === 'true');

  readonly termsLink = computed(() => this.rebrandingService.rebranding().termsLink);

  onDismiss(): void {
    localStorage.setItem(this.STORAGE_KEY, 'true');
    this.dismissed.set(true);
  }
}
