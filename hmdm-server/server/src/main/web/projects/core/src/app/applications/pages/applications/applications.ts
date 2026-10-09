import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import {
  BaseComponent,
  LoaderDirective,
  MatButtonModule,
  MatCardModule,
  MatIconModule,
  SearchContainer,
  TranslatePipe,
} from 'hmdm-ui-kit';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { ApplicationsSearchForm } from '../../components/applications-search-form/applications-search-form';
import { ApplicationsTable } from '../../components/applications-table/applications-table';
import { ApplicationsSearchFormConfig } from '../../configuration/applications-search-form.config';
import { ApplicationsTableConfig } from '../../configuration/applications-table.config';
import { ApplicationDialogService } from '../../services/application-dialog.service';
import { ApplicationFacadeService } from '../../services/application-facade.service';

@Component({
  selector: 'core-applications',
  templateUrl: './applications.html',
  styleUrl: './applications.scss',
  imports: [
    ApplicationsSearchForm,
    ApplicationsTable,
    TranslatePipe,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    SearchContainer,
    MatButtonModule,
    LoaderDirective,
    HasPermissionDirective,
  ],
  providers: [ApplicationsTableConfig, ApplicationsSearchFormConfig, ApplicationDialogService],
})
export class Applications extends BaseComponent implements OnInit {
  private readonly applicationsTableConfig = inject(ApplicationsTableConfig);
  private readonly applicationsFormConfig = inject(ApplicationsSearchFormConfig);
  private readonly applicationFacadeService = inject(ApplicationFacadeService);
  private readonly applicationDialogService = inject(ApplicationDialogService);

  tableSearchControl = new FormControl<string>('');
  activeFiltersCount: WritableSignal<number> = signal(0);
  isLoadingApplications: WritableSignal<boolean> =
    this.applicationFacadeService.isLoadingApplications;

  tableConfig = this.applicationsTableConfig.getConfig();
  formGroup = this.applicationsFormConfig.getFormGroup();

  ngOnInit(): void {
    this.formGroup.valueChanges.pipe(this.untilDestroyed()).subscribe(() => {
      this.activeFiltersCount.set(
        Object.values(this.formGroup.getRawValue()).filter((value) => Boolean(value)).length,
      );
      this.applicationFacadeService.onFormValueChanges(this.formGroup.getRawValue());
    });

    this.tableSearchControl.valueChanges
      .pipe(this.untilDestroyed(), debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        this.applicationFacadeService.onSearchTermChange(this.tableSearchControl.value || '');
      });

    this.applicationFacadeService.clearFilters();
  }

  onAddApplicationClick(): void {
    this.applicationDialogService.openAddApplicationDialog();
  }
}
