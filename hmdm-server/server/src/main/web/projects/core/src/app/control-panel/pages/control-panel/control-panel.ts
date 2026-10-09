import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { PageEvent } from '@angular/material/paginator';
import { TranslatePipe } from '@ngx-translate/core';
import {
  BaseComponent,
  LoaderDirective,
  SearchContainer,
  Table,
  TTableConfig,
  TTableSortState,
  Selector,
  TOption,
} from 'hmdm-ui-kit';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CpAppsTableConfig } from '../../configuration/cp-apps-table.config';
import { CustomersTableConfig } from '../../configuration/customers-table.config';
import { ControlPanelAppsFacadeService } from '../../services/control-panel-apps-facade.service';
import { CustomersFacadeService } from '../../services/customers-facade.service';

@Component({
  selector: 'core-control-panel',
  templateUrl: './control-panel.html',
  styleUrl: './control-panel.scss',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatDivider,
    MatIconModule,
    MatTabsModule,
    Table,
    TranslatePipe,
    LoaderDirective,
    SearchContainer,
    Selector,
  ],
})
export class ControlPanel extends BaseComponent implements OnInit {
  private readonly customersFacadeService = inject(CustomersFacadeService);
  private readonly controlPanelAppsFacadeService = inject(ControlPanelAppsFacadeService);
  private readonly customersTableConfigService = inject(CustomersTableConfig);
  private readonly cpAppsTableConfigService = inject(CpAppsTableConfig);

  // Customers tab
  customersTableConfig: TTableConfig = this.customersTableConfigService.getConfig();
  customersData = this.customersFacadeService.data;
  customersTotalItems = this.customersFacadeService.totalItems;
  isLoadingCustomers = this.customersFacadeService.isLoading;

  customersSearchControl = new FormControl<string | null>('');
  accountTypeControl = new FormControl<number | null>(null);
  customerStatusControl = new FormControl<string | null>(null);
  customersActiveFiltersCount: WritableSignal<number> = signal(0);

  readonly accountTypeOptions: TOption<number>[] = [
    { value: 0, viewValue: 'customer.type.demo' },
    { value: 1, viewValue: 'customer.type.small' },
    { value: 2, viewValue: 'customer.type.corporate' },
  ];

  readonly customerStatusOptions: TOption<string>[] = [
    { value: 'customer.new', viewValue: 'customer.new' },
    { value: 'customer.active', viewValue: 'customer.active' },
    { value: 'customer.need.followup', viewValue: 'customer.need.followup' },
    { value: 'customer.followup.sent', viewValue: 'customer.followup.sent' },
    { value: 'customer.internal.test', viewValue: 'customer.internal.test' },
    { value: 'customer.developer', viewValue: 'customer.developer' },
    { value: 'customer.difficult', viewValue: 'customer.difficult' },
    { value: 'customer.inactive', viewValue: 'customer.inactive' },
    { value: 'customer.pause', viewValue: 'customer.pause' },
    { value: 'customer.abandon', viewValue: 'customer.abandon' },
    { value: 'customer.denial', viewValue: 'customer.denial' },
    { value: 'customer.onpremise', viewValue: 'customer.onpremise' },
    { value: 'customer.client', viewValue: 'customer.client' },
  ];

  // Apps tab
  appsTableConfig: TTableConfig = this.cpAppsTableConfigService.getConfig();
  appsData = this.controlPanelAppsFacadeService.data;
  isLoadingApps = this.controlPanelAppsFacadeService.isLoading;
  appsSearchControl = new FormControl<string | null>('');

  ngOnInit(): void {
    this.customersFacadeService.searchCustomers();
    this.controlPanelAppsFacadeService.searchApplications();

    this.customersSearchControl.valueChanges
      .pipe(this.untilDestroyed(), debounceTime(500), distinctUntilChanged())
      .subscribe((value) => {
        this.customersFacadeService.updateSearchTerm(value || '');
        this.onCustomersSearch();
      });

    this.accountTypeControl.valueChanges
      .pipe(this.untilDestroyed(), distinctUntilChanged())
      .subscribe(() => this.onFiltersChange());

    this.customerStatusControl.valueChanges
      .pipe(this.untilDestroyed(), distinctUntilChanged())
      .subscribe(() => this.onFiltersChange());

    this.appsSearchControl.valueChanges
      .pipe(this.untilDestroyed(), debounceTime(500), distinctUntilChanged())
      .subscribe((value) => {
        this.controlPanelAppsFacadeService.searchApplications(value || '');
      });
  }

  onCustomersSearch(): void {
    this.customersFacadeService.resetPagination();
    this.customersFacadeService.searchCustomers();
  }

  onFiltersChange(): void {
    this.customersFacadeService.updateFilters(
      this.accountTypeControl.value ?? undefined,
      this.customerStatusControl.value ?? undefined,
    );
    this.customersActiveFiltersCount.set(
      [this.accountTypeControl.value, this.customerStatusControl.value].filter((v) => v !== null)
        .length,
    );
    this.onCustomersSearch();
  }

  onAccountTypeChange(value: number | null): void {
    this.accountTypeControl.setValue(value, { emitEvent: false });
    this.onFiltersChange();
  }

  onCustomerStatusChange(value: string | null): void {
    this.customerStatusControl.setValue(value, { emitEvent: false });
    this.onFiltersChange();
  }

  onCustomersPageChange(event: PageEvent): void {
    this.customersFacadeService.updatePage(event);
  }

  onCustomersSortChange(event: TTableSortState | null): void {
    this.customersFacadeService.updateSort(event);
  }

  onAddCustomerClick(): void {
    this.customersFacadeService.openCreateDialog();
  }

  onAppsSearch(): void {
    this.controlPanelAppsFacadeService.searchApplications(this.appsSearchControl.value || '');
  }
}
