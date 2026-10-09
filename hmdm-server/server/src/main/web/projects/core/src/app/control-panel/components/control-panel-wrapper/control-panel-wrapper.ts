import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { User } from '../../../shared/components/user/user';

@Component({
  selector: 'core-control-panel-wrapper',
  templateUrl: './control-panel-wrapper.html',
  styleUrl: './control-panel-wrapper.scss',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, RouterOutlet, User, TranslatePipe],
})
export class ControlPanelWrapper {
  private readonly router = inject(Router);

  onBack(): void {
    this.router.navigate(['/home']);
  }
}
