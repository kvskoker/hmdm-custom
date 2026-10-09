import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { IdleService } from '../../services/idle.service';
import { AboutDialog } from '../about-dialog/about-dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'core-user',
  templateUrl: './user.html',
  styleUrl: './user.scss',
  imports: [MatIconModule, MatMenuModule, TranslatePipe, MatButtonModule],
})
export class User {
  private readonly authService = inject(AuthService);
  private readonly idleService = inject(IdleService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  currentUser = this.authService.currentUser;
  isSuperAdmin = computed(() => !!this.currentUser()?.superAdmin);
  isSuperAdminOrAdmin = computed(() =>
    !!this.currentUser()?.superAdmin ||
    !!(this.currentUser()?.singleCustomer && this.authService.hasPermission('settings'))
  );
  isOnControlPanel = computed(() => this.router.url.startsWith('/control-panel'));

  onLogOut(): void {
    this.authService.logout().subscribe(() => {
      this.idleService.clearTimeout();
    });
  }

  onProfileClick(): void {
    this.router.navigate(['/home/profile']);
  }

  onAboutClick(): void {
    this.dialog.open(AboutDialog);
  }

  onControlPanelClick(): void {
    if (this.isOnControlPanel()) {
      this.router.navigate(['/home/devices']);
    } else {
      this.router.navigate(['/control-panel']);
    }
  }

  onLicensesClick(): void {
    this.router.navigate(['/home/licenses']);
  }

  onUpdatesClick(): void {
    this.router.navigate(['/home/updates']);
  }
}
