import { Component, computed, inject, Signal } from '@angular/core';
import { BaseCellRenderer } from 'hmdm-ui-kit';
import { TDevice } from '../../types/device.type';
import { Router } from '@angular/router';

@Component({
  selector: 'core-configuration-cell',
  templateUrl: './configuration-cell.html',
  styleUrl: './configuration-cell.scss',
  imports: [],
})
export class ConfigurationCell extends BaseCellRenderer<TDevice, null> {
  private readonly router = inject(Router);

  configurationName: Signal<string> = computed(
    () => this.params().data?.configuration?.name ?? '',
  );

  onClick(): void {
    this.router.navigate([
      'home',
      'configurations',
      'details',
      this.params().data?.configuration.id,
    ]);
  }
}
