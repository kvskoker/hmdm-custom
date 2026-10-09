import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import {
  Checkbox,
  LoaderDirective,
  MatButtonModule,
  MatIconModule,
  SearchContainer,
  TranslatePipe,
  PersistControlDirective,
  BaseComponent,
} from 'hmdm-ui-kit';
import { ConfigurationAppsTable } from '../../components/configuration-apps-table/configuration-apps-table';
import { ConfigurationApplicationDialogService } from '../../services/configuration-application-dialog.service';
import { ConfigurationAppsFacadeService } from '../../services/configuration-applications-facade.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'core-configuration-app',
  templateUrl: './configuration-app.html',
  styleUrl: './configuration-app.scss',
  imports: [
    MatCardModule,
    SearchContainer,
    MatIconModule,
    MatDividerModule,
    TranslatePipe,
    LoaderDirective,
    ConfigurationAppsTable,
    MatButtonModule,
    Checkbox,
    ReactiveFormsModule,
    PersistControlDirective,
  ],
})
export class ConfigurationApp extends BaseComponent implements OnInit {
  private readonly configurationAppDialogService = inject(ConfigurationApplicationDialogService);
  private readonly configurationAppsFacadeService = inject(ConfigurationAppsFacadeService);

  tableSearchControl: FormControl<string> = new FormControl<string>('', { nonNullable: true });
  systemControl: FormControl<boolean> = new FormControl<boolean>(false, { nonNullable: true });
  activeFiltersCount: WritableSignal<number> = signal(0);
  isLoadingApplications: WritableSignal<boolean> =
    this.configurationAppsFacadeService.isLoadingApplications;

  ngOnInit(): void {
    this.tableSearchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged(), this.untilDestroyed())
      .subscribe(() => {
        this.configurationAppsFacadeService.setTableSearch(this.tableSearchControl.value);
      });

    this.systemControl.valueChanges.pipe(this.untilDestroyed()).subscribe(() => {
      this.activeFiltersCount.set(this.systemControl.value ? 1 : 0);
      this.configurationAppsFacadeService.setShowSystemApps(this.systemControl.value);
    });
  }

  onAddApplicationClick(): void {
    this.configurationAppDialogService.openAddDialog();
  }
}
