import { Component, inject, OnInit, signal, ViewContainerRef, WritableSignal } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { provideNgxMask } from 'ngx-mask';
import { catchError, finalize, of, switchMap, take } from 'rxjs';
import { AuthService } from './shared/services/auth.service';
import { SettingsFacadeService } from './shared/services/settings-facade.service';
import { VersionCheckerService } from './shared/services/version-checker.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'core-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  providers: [provideNgxMask()],
  imports: [RouterOutlet, MatSidenavModule, MatProgressSpinner],
})
export class App implements OnInit {
  private authService: AuthService = inject(AuthService);
  private readonly settingsFacadeService = inject(SettingsFacadeService);
  private readonly versionCheckerService = inject(VersionCheckerService);

  isLoading: WritableSignal<boolean> = signal(true);

  constructor(public viewContainerRef: ViewContainerRef) {}

  ngOnInit(): void {
    !environment.development && this.versionCheckerService.startChecking();

    this.authService
      .getCurrentUser()
      .pipe(
        switchMap(() => this.authService.init()),
        switchMap(() => this.settingsFacadeService.fetchSettings()),
        switchMap(() => this.settingsFacadeService.fetchStorageLimit()),
        catchError(() => of(void 0)),
        take(1),
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe(() => {});
  }
}
