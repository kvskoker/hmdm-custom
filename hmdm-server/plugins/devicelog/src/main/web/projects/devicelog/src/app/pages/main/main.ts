import { Component, inject, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  BaseComponent,
  LoaderDirective,
  MatButtonModule,
  MatCardModule,
  MatDividerModule,
  MatIconModule,
  MatProgressSpinner,
  PersistFormDirective,
  SearchContainer,
  TranslatePipe,
} from 'hmdm-ui-kit';
import { debounceTime, distinctUntilChanged, interval, tap } from 'rxjs';
import { LogsTable } from '../../components/logs-table/logs-table';
import { LogsSearchForm } from '../../components/search-form/search-form';
import { SearchMessagesFormConfig } from '../../config/search-logs-form.config';
import { LogsFacadeService } from '../../services/logs-facade.service';

@Component({
  selector: 'logs-messaging',
  templateUrl: './main.html',
  styleUrl: './main.scss',
  imports: [
    MatCardModule,
    LoaderDirective,
    SearchContainer,
    TranslatePipe,
    MatDividerModule,
    MatIconModule,
    LogsTable,
    MatButtonModule,
    PersistFormDirective,
    LogsSearchForm,
    MatProgressSpinner,
  ],
})
export class Main extends BaseComponent implements OnInit {
  @ViewChild('table') table!: LogsTable;

  private readonly logsFacadeService = inject(LogsFacadeService);
  private readonly searchMessagesFormConfig = inject(SearchMessagesFormConfig);
  private readonly activatedRoute = inject(ActivatedRoute);

  tableSearchControl: FormControl<string> = new FormControl('', { nonNullable: true });
  isLoadingMessages = this.logsFacadeService.isLoadingMessages;
  isUpdatingSilently = this.logsFacadeService.isUpdatingSilently;
  formGroup = this.searchMessagesFormConfig.getFormGroup();
  activeFiltersCount: WritableSignal<number> = signal(0);

  ngOnInit(): void {
    if (this.activatedRoute.snapshot.queryParams['deviceNumber']) {
      const value = this.activatedRoute.snapshot.queryParams['deviceNumber'];

      setTimeout(() => {
        this.formGroup.patchValue({
          deviceFilter: value,
        });
      });
    }

    interval(60_000)
      .pipe(this.untilDestroyed())
      .subscribe(() => this.logsFacadeService.silentUpdateLogs());

    this.formGroup.valueChanges
      .pipe(
        this.untilDestroyed(),
        tap(() => {
          let cnt = 0;

          if (
            this.formGroup.controls.dateRange.value?.start ||
            this.formGroup.controls.dateRange.value?.end
          ) {
            cnt++;
          }
          if (this.formGroup.controls.severity.value > 0) {
            cnt++;
          }
          if (this.formGroup.controls.deviceFilter.value) {
            cnt++;
          }
          if (this.formGroup.controls.applicationFilter.value) {
            cnt++;
          }
          if (this.formGroup.controls.severity.value >= 0) {
            cnt++;
          }

          this.activeFiltersCount.set(cnt);
          debounceTime(300);
        }),
      )
      .subscribe(() => {
        this.table?.resetPagination();
        this.logsFacadeService.setFormData(this.formGroup.getRawValue());
      });

    this.tableSearchControl.valueChanges
      .pipe(this.untilDestroyed(), debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.table.resetPagination();
        this.logsFacadeService.setSearchTerm(this.tableSearchControl.value);
      });
  }

  onExportClick(): void {
    this.logsFacadeService.exportLogs();
  }
}
