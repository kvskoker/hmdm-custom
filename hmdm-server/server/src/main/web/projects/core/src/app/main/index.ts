import { Component } from '@angular/core';
import { Wrapper } from './components/wrapper/wrapper';

@Component({
  selector: 'core-index-main',
  imports: [Wrapper],
  template: `<core-wrapper></core-wrapper>`,
})
export class IndexMain {}
