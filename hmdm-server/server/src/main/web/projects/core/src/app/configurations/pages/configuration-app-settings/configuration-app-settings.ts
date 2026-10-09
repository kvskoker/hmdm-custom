import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import {
  BaseComponent,
  LoaderDirective,
  MatButtonModule,
  MatCardModule,
  MatIconModule,
  PersistControlDirective,
  SearchContainer,
  TextInputComponent,
  TranslatePipe,
} from 'hmdm-ui-kit';
import { ConfigurationAppSettingsTable } from '../../components/configuration-app-settings-table/configuration-app-settings-table';
import { ConfigurationAppSettingsDialogService } from '../../services/configuration-app-settings-dialog.service';

@Component({
  selector: 'core-configuration-app-settings',
  templateUrl: './configuration-app-settings.html',
  styleUrl: './configuration-app-settings.scss',
  imports: [
    MatCardModule,
    SearchContainer,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    MatDividerModule,
    ConfigurationAppSettingsTable,
    PersistControlDirective,
    ReactiveFormsModule,
    TextInputComponent,
  ],
})
export class ConfigurationAppSettings extends BaseComponent implements OnInit {
  private readonly dialogService: ConfigurationAppSettingsDialogService = inject(
    ConfigurationAppSettingsDialogService,
  );

  tableSearchControl: FormControl<string> = new FormControl('', { nonNullable: true });
  settingsSearchControl: FormControl<string> = new FormControl('', { nonNullable: true });
  activeFiltersCount: WritableSignal<number> = signal(0);

  ngOnInit(): void {
    this.settingsSearchControl.valueChanges.pipe(this.untilDestroyed()).subscribe(() => {
      this.activeFiltersCount.set(this.settingsSearchControl.value ? 1 : 0);
    });
  }

  onAddAppSettingsClick(): void {
    this.dialogService.openAddDialog();
  }
}
