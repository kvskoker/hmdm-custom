import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { Component, input, InputSignal, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'hmdm-help-tooltip',
  templateUrl: './help-tooltip.component.html',
  styleUrls: ['./help-tooltip.component.scss'],
  imports: [MatButtonModule, MatIconModule, CdkOverlayOrigin, CdkConnectedOverlay, TranslatePipe],
})
export class HelpTooltip {
  text: InputSignal<string> = input.required<string>();

  isOpen = signal(false);

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  close(): void {
    this.isOpen.set(false);
  }
}
