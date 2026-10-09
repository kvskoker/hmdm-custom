import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import {finalize, forkJoin, Subscription, take} from 'rxjs';
import { CookieNotice } from '../../../shared/components/cookie-notice/cookie-notice';
import { Header } from '../../../shared/components/header/header';
import { SideMenu } from '../../../shared/components/side-menu/side-menu';
import { AuthService } from '../../../shared/services/auth.service';
import { GlobalLoaderService } from '../../../shared/services/global-loader.service';
import { IdleService } from '../../../shared/services/idle.service';
import { LanguageService } from '../../../shared/services/language.service';
import { SettingsFacadeService } from '../../../shared/services/settings-facade.service';
import {PushMessagesService} from '../../../shared/services/push-messages.service';

@Component({
  selector: 'core-wrapper',
  templateUrl: './wrapper.html',
  styleUrl: './wrapper.scss',
  imports: [RouterOutlet, MatSidenavModule, SideMenu, Header, MatProgressSpinner, CookieNotice],
})
export class Wrapper implements OnInit, OnDestroy {
  private readonly authService: AuthService = inject(AuthService);
  private readonly languageService: LanguageService = inject(LanguageService);
  private readonly idleService = inject(IdleService);
  private readonly settingsFacadeService = inject(SettingsFacadeService);
  private readonly globalLoaderService = inject(GlobalLoaderService);
  private readonly pushMessagesService = inject(PushMessagesService);

  private wsSubscription!: Subscription;

  private readonly DRAWER_STATE_KEY = 'drawerOpened';

  isLoading = this.globalLoaderService.isLoading;
  drawerOpened = localStorage.getItem(this.DRAWER_STATE_KEY) !== 'false';

  onDrawerToggle(opened: boolean): void {
    localStorage.setItem(this.DRAWER_STATE_KEY, String(opened));
  }

  ngOnInit(): void {
    this.globalLoaderService.show();
    this.idleService.init();

    this.wsSubscription =
      this.pushMessagesService.listenForPushMessages('ws/alerts')
      .subscribe();

    forkJoin({
      settings: this.settingsFacadeService.fetchSettings(),
      auth: this.authService.init(),
    })
      .pipe(
        take(1),
        finalize(() => this.globalLoaderService.hide()),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }
}
