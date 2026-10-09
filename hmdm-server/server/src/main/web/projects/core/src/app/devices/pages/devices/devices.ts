import {
  AfterViewInit,
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
  TemplateRef,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { PageEvent } from '@angular/material/paginator';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import {
  BaseComponent,
  ConfirmDialog,
  LoaderDirective,
  SearchContainer,
  Table,
  TTableConfig,
  TTableSortState,
} from 'hmdm-ui-kit';
import { debounceTime, distinctUntilChanged, filter, interval, take } from 'rxjs';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { SettingsFacadeService } from '../../../shared/services/settings-facade.service';
import { DevicesFormDialog } from '../../components/devices-form-dialog/devices-form-dialog';
import { DevicesForm } from '../../components/search-devices-form/devices-form';
import { DeviceTableConfig } from '../../configuration/devices-table.config';
import { DevicesFacadeService } from '../../services/devices-facade.service';
import { TDevice } from '../../types/device.type';
import {LicenseService} from '../../../auth/services/license.service';
import {DeviceLicenseAlertDialog} from '../../components/device-license-alert-dialog/device-license-alert-dialog';

@Component({
  selector: 'core-devices',
  templateUrl: './devices.html',
  styleUrl: './devices.scss',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatDivider,
    MatIconModule,
    Table,
    HasPermissionDirective,
    DevicesForm,
    MatMenuModule,
    TranslatePipe,
    MatBadgeModule,
    SearchContainer,
    LoaderDirective,
    MatProgressSpinner,
  ],
})
export class Devices extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('table') table!: Table<TDevice>;
  @ViewChild('filtersTemplate', { read: TemplateRef }) filtersTemplate!: TemplateRef<any>;

  private readonly devicesFacadeService = inject(DevicesFacadeService);
  private readonly deviceTableConfig = inject(DeviceTableConfig);
  private readonly dialog = inject(MatDialog);
  private readonly settingsFacadeService = inject(SettingsFacadeService);
  private readonly licenseService = inject(LicenseService);

  isShowMore: WritableSignal<boolean> = signal<boolean>(false);
  isSearchMenuOpen: WritableSignal<boolean> = signal<boolean>(false);
  tableConfig: TTableConfig = this.deviceTableConfig.getConfig();
  tableData = this.devicesFacadeService.data;
  selectedDevices: WritableSignal<TDevice[]> = signal<TDevice[]>([]);
  totalItems = this.devicesFacadeService.totalItems;
  tableSearchControl = new FormControl<string>('');
  activeFiltersCnt: WritableSignal<number> = signal<number>(0);
  isLoadingDevices = this.devicesFacadeService.isLoadingDevices;
  isLoadingSettings = this.devicesFacadeService.isLoadingSettings;
  isUpdatingSilently = this.devicesFacadeService.isUpdatingSilently;

  isDeviceLimitReached = computed(() => {
    const s = this.settingsFacadeService.settings();
    return !!s && s.deviceLimit > 0 && s.deviceCount >= s.deviceLimit;
  });

  isDeviceLimitByLicenseReached = computed(() => {
    const s = this.settingsFacadeService.settings();
    const l = this.licenseService.pluginLicenseKeyData();

    if (!s || !l) return false;

    const deviceCount = s.deviceCount ?? 0;
    const licenseDevices = l.devices ?? 0;

    return (licenseDevices > 0 && deviceCount >= licenseDevices);
  });

  constructor() {
    super();

    effect(() => {
      const deviceSettings = this.devicesFacadeService.deviceSettings();
      if (deviceSettings) {
        this.tableConfig = this.deviceTableConfig.getConfig();
      }
    });
  }

  ngOnInit(): void {
    if (!this.licenseService.pluginLicenseKeyData()) {
      this.licenseService.getPluginLicenseKey().subscribe({
        next: (value) => {
          this.licenseService.pluginLicenseKeyData.set(value);
        },
        error: (err) => {
          this.licenseService.pluginLicenseKeyData.set(null);
        }
      });
    }

    this.devicesFacadeService.resetLastRequest();

    this.tableSearchControl.valueChanges
      .pipe(this.untilDestroyed(), debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        this.devicesFacadeService.updateSearchData(this.tableSearchControl.value || '');
        this.onSearchClick();
      });

    interval(60_000)
      .pipe(this.untilDestroyed())
      .subscribe(() => this.devicesFacadeService.silentUpdateDevices());
  }

  ngAfterViewInit(): void {
    this.devicesFacadeService.updateSearchData(this.tableSearchControl.value || '');
    this.searchDevices();
  }

  onTableSortChange($event: TTableSortState | null): void {
    this.devicesFacadeService.updateSort($event);
  }

  onTablePageChange($event: PageEvent): void {
    this.devicesFacadeService.updatePage($event);
  }

  onTableSelectionChange($event: TDevice[]): void {
    this.selectedDevices.set($event);
  }

  onShowMoreClick(): void {
    this.isShowMore.set(!this.isShowMore());
  }

  toggleSearchMenu(): void {
    this.isSearchMenuOpen.set(!this.isSearchMenuOpen());
  }

  onSearchClick(): void {
    this.table.resetPagination();
    this.devicesFacadeService.resetPagination();
    this.searchDevices();
  }

  onAddClick(): void {
    if (this.isDeviceLimitByLicenseReached()) {
      this.dialog
        .open(DeviceLicenseAlertDialog, {
          minWidth: '400px'
        })
        .afterClosed()
        .pipe(
          take(1),
          filter(Boolean)
        )
        .subscribe(() => {
          this.openDeviceFormDialog();
        });

    } else {
      this.openDeviceFormDialog();
    }
  }

  private openDeviceFormDialog(): void {
    this.dialog
      .open(DevicesFormDialog, {
        minWidth: '400px',
      })
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe((result) => {
        this.devicesFacadeService.createDevice(result);
      });
  }

  onSetConfigurationClick(): void {
    this.devicesFacadeService.openSetConfigurationDialog(this.getSelectedDeviceIds());
  }

  onSetGroupClick(): void {
    this.devicesFacadeService.openSetGroupDialog(this.getSelectedDeviceIds());
  }

  onDeleteClick(): void {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          title: '',
          message: 'question.delete.device.bulk',
          confirmButtonText: 'button.delete',
          cancelButtonText: 'button.cancel',
        },
      })
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe(() => {
        this.devicesFacadeService.deleteSelectedDevices(this.getSelectedDeviceIds());
      });
  }

  onFormValueChange($event: any): void {
    this.devicesFacadeService.updateFormData($event);

    this.activeFiltersCnt.set(
      Object.values($event).reduce((acc: number, value) => {
        if (!value) return acc;

        if (typeof value === 'object' && !Array.isArray(value)) {
          return Object.values(value).some((innerValue) => innerValue) ? acc + 1 : acc;
        }

        return acc + 1;
      }, 0),
    );
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  private getSelectedDeviceIds(): number[] {
    return this.selectedDevices()
      .map((device) => device.id)
      .filter((id): id is number => id !== undefined);
  }

  private searchDevices(): void {
    this.devicesFacadeService.searchDevices();
  }
}
