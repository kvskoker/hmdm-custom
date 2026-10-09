import { Component, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { User } from '../user/user';

@Component({
  selector: 'core-header',
  templateUrl: './header.html',
  styleUrl: './header.scss',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, User],
})
export class Header {
  toggleMenu = output<void>();

  onMenuButtonClick(): void {
    this.toggleMenu.emit();
  }
}
