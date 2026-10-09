import { Component } from '@angular/core';
import { provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'lib-hmdm-ui-kit',
  imports: [],
  template: ` <p>hmdm-ui-kit works!</p> `,
  styles: ``,
  providers: [provideNgxMask()],
})
export class HmdmUiKit {}
