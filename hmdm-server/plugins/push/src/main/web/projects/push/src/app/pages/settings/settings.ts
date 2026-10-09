import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCardModule, TextInputComponent, TranslatePipe, MatButtonModule } from 'hmdm-ui-kit';
import { SettingsFacadeService } from '../../services/settings-facade.service';

@Component({
  selector: 'push-settings',
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
  imports: [MatCardModule, TextInputComponent, TranslatePipe, ReactiveFormsModule, MatButtonModule],
})
export class Settings {
  private readonly settingsFacadeService: SettingsFacadeService = inject(SettingsFacadeService);

  purgeControl = new FormControl(7, { nonNullable: true });

  onPurge(): void {
    const days = this.purgeControl.value;
    this.settingsFacadeService.purgeMessages(days).subscribe();
  }
}
