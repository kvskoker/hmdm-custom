import { Component } from '@angular/core';
import { ControlPanelWrapper } from './components/control-panel-wrapper/control-panel-wrapper';

@Component({
  selector: 'core-index-control-panel',
  imports: [ControlPanelWrapper],
  template: `<core-control-panel-wrapper></core-control-panel-wrapper>`,
})
export class ControlPanelIndex {}
