import { Component, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'core-alert-container',
  templateUrl: './alert-container.html',
  styleUrl: './alert-container.scss',
  imports: [TranslatePipe],
})
export class AlertContainer {
  data = inject(MAT_SNACK_BAR_DATA);
}
