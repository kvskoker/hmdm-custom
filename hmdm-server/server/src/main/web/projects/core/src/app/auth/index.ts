import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthContainer } from './components/auth-container/auth-container';

@Component({
  selector: 'core-index-auth',
  imports: [RouterOutlet, AuthContainer],
  template: `<core-auth-container><router-outlet></router-outlet></core-auth-container>`,
})
export class IndexAuth {}
