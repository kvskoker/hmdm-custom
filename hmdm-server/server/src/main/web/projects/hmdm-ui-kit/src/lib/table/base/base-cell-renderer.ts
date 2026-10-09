import { Component, input } from '@angular/core';
import { TCellRendererParams } from '../types/cell-renderer-params.type';
import { BaseComponent } from '../../../public-api';

@Component({
  selector: 'hmdm-base-cell-renderer',
  template: '',
})
export abstract class BaseCellRenderer<T = any, P = any> extends BaseComponent {
  params = input.required<TCellRendererParams<T, P>>();
}
