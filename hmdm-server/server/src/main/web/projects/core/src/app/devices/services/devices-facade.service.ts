import {
  computed,
  effect,
  inject,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ConfirmDialog, TOption, TTableSortState } from 'hmdm-ui-kit';
import { filter, finalize, take, tap } from 'rxjs';
import { DevicesService } from '../../entity/device/services/devices.service';
import { TDeviceDTO } from '../../entity/device/types/device-dto.type';
import { TSearchDevicesRequest } from '../../entity/device/types/search-devices-request.type';
import { TDevicesSettingsDTO } from '../../entity/settings/types/devices-settings-dto.type';
import { DevicesSettingsFacadeService } from '../../settings/services/devices-settings-facade.service';
import { ConfigurationService } from '../../shared/services/configuration.service';
import { GroupService } from '../../shared/services/group.service';
import { SettingsFacadeService } from '../../shared/services/settings-facade.service';
import { UserStateService } from '../../shared/services/user-state.service';
import { TGroup } from '../../shared/types/group.type';
import { TOptional } from '../../shared/types/optional.type';
import { ConfigurationBulkDialog } from '../components/configuration-bulk-dialog/configuration-bulk-dialog';
import { GroupBulkDialog } from '../components/group-bulk-dialog/group-bulk-dialog';
import { DEVICE_ONLINE_STATUS } from '../const/device-online-status-options.const';
import { CUSTOM_TIME_VALUE } from '../const/device-time-options.const';
import { DEVICES_SORT_MAPPER } from '../const/devices-sort-mapper.const';
import { TConfiguration } from '../../entity/configuration/types/configuration.type';
import { TDeviceFormValue } from '../types/device-form-value.type';
import { TSearchDevicesFormValue } from '../types/search-devices-form-value.type';
import { LicenseService } from '../../auth/services/license.service';

@Injectable({ providedIn: 'root' })
export class DevicesFacadeService {
  private readonly devicesService: DevicesService = inject(DevicesService);
  private readonly groupService: GroupService = inject(GroupService);
  private readonly configurationsService: ConfigurationService = inject(ConfigurationService);
  private readonly dialog = inject(MatDialog);
  private readonly userService = inject(UserStateService);
  private readonly settingsService = inject(DevicesSettingsFacadeService);
  private readonly settingsFacadeService = inject(SettingsFacadeService);
  private readonly licenseService = inject(LicenseService);

  private readonly SORT_MAPPER: Record<string, string> = DEVICES_SORT_MAPPER;
  private readonly _data: WritableSignal<any[]> = signal([]);
  private readonly _totalItems: WritableSignal<number> = signal(0);
  private readonly _deviceSettings: WritableSignal<TDevicesSettingsDTO | null> = signal(null);

  private pageData: PageEvent = { pageIndex: 0, pageSize: 50, length: 0 };
  private sortData: TTableSortState | null = null;
  private formData: TOptional<TSearchDevicesFormValue> | null = null;
  private searchTerm: string = '';
  private lastRequestBody: TSearchDevicesRequest | null = null;
  private currentUserId: number | null | undefined = undefined;

  deviceSettings: Signal<TDevicesSettingsDTO | null> = this._deviceSettings.asReadonly();
  isLoadingDevices: WritableSignal<boolean> = signal(true);
  isLoadingSettings: WritableSignal<boolean> = signal(false);
  isUpdatingSilently: WritableSignal<boolean> = signal(false);
  data: Signal<any[]> = this._data.asReadonly();
  totalItems: Signal<number> = this._totalItems.asReadonly();
  groups: Signal<TOption<number>[]> = computed(() =>
    this.groupsToOption(this.groupService.allGroups()),
  );
  configurations: Signal<TOption<number>[]> = computed(() =>
    this.configurationsToOption(this.configurationsService.allConfigurations()),
  );

  constructor() {
    this.isLoadingSettings.set(true);

    effect(() => {
      const currentUser = this.userService.currentUser();

      if (currentUser) {
        const isUserChanged =
          this.currentUserId !== undefined && this.currentUserId !== currentUser.id;
        this.currentUserId = currentUser.id;

        if (isUserChanged) {
          this.lastRequestBody = null;
          this.searchDevices();
        }

        this.fetchDeviceSettings();
      } else {
        this.isLoadingSettings.set(false);
      }
    });
  }

  fetchDeviceSettings() {
    const currentUser = this.userService.currentUser();
    const roleId = currentUser?.userRole.id;

    if (!roleId) {
      this.isLoadingSettings.set(false);
      return;
    }

    this.settingsService
      .getDevicesSettingsByRole(roleId)
      .pipe(
        take(1),
        tap((settings) => {
          this._deviceSettings.set(settings);
        }),
        finalize(() => this.isLoadingSettings.set(false)),
      )
      .subscribe();
  }

  searchDevices(opts?: { force: boolean }): void {
    const body = this.getRequestBody();

    const isSameRequest =
      this.lastRequestBody !== null &&
      JSON.stringify(this.lastRequestBody) === JSON.stringify(body);

    if (isSameRequest && !opts?.force) {
      return;
    }

    this.lastRequestBody = body;

    this.isLoadingDevices.set(true);
    this.devicesService
      .getAllDevices(body)
      .pipe(
        take(1),
        finalize(() => this.isLoadingDevices.set(false)),
      )
      .subscribe({
        next: (response) => {
          this._data.set(response.data.items || []);
          this._totalItems.set(response.data.totalItemsCount || 0);
        },
        error: (error) => {
          console.error('Error fetching devices:', error);
          this._data.set([]);
        },
      });
  }

  createDevice(data: TDeviceFormValue): void {
    const body: TDeviceDTO = {
      ...data,
      groups: data.groups ? data.groups.map((groupId) => ({ id: groupId })) : [],
    };

    this.devicesService
      .createDevice(body)
      .pipe(take(1))
      .subscribe(() => {
        this.forceSearchDevices();
        this.settingsFacadeService.fetchSettings().subscribe();
        this.licenseService.refreshLicenses();
      });
  }

  updateDevice(data: TDeviceFormValue, id: number): void {
    const body: TDeviceDTO = {
      ...data,
      id,
      groups: data.groups ? data.groups.map((groupId) => ({ id: groupId })) : [],
    };

    this.devicesService
      .updateDevice(body)
      .pipe(take(1))
      .subscribe(() => this.forceSearchDevices());
  }

  updateSearchData(term: string): void {
    this.searchTerm = term;
  }

  resetLastRequest(): void {
    this.lastRequestBody = null;
  }

  updateFormData(data: TOptional<TSearchDevicesFormValue>): void {
    this.formData = data;
  }

  updatePage($event: PageEvent): void {
    this.pageData = $event;
    this.searchDevices();
  }

  updateSort($event: TTableSortState | null): void {
    if (this.sortData === $event) {
      return;
    }

    this.sortData = $event;
    this.searchDevices();
  }

  openDeleteDialog(ids: number[]): void {
    this.dialog
      .open(ConfirmDialog)
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe(() => this.deleteSelectedDevices(ids));
  }

  deleteSelectedDevices(ids: number[]): void {
    this.devicesService
      .deleteBulk(ids)
      .pipe(take(1))
      .subscribe(() => {
        this.forceSearchDevices();
        this.settingsFacadeService.fetchSettings().subscribe();
        this.licenseService.refreshLicenses();
      });
  }

  openSetGroupDialog(ids: number[]): void {
    this.dialog
      .open(GroupBulkDialog)
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe((result) => {
        const body = {
          ...result,
          groups: result.groups.map((groupId: number) => ({ id: groupId })),
          ids,
        };
        this.devicesService
          .groupBulk(body)
          .pipe(take(1))
          .subscribe(() => this.forceSearchDevices());
      });
  }

  openSetConfigurationDialog(ids: number[]): void {
    this.dialog
      .open(ConfigurationBulkDialog)
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe((result) => {
        const body = {
          ...result,
          ids,
        };

        this.devicesService
          .configurationBulk(body)
          .pipe(take(1))
          .subscribe(() => this.forceSearchDevices());
      });
  }

  resetPagination(): void {
    this.pageData.pageIndex = 0;
  }

  silentUpdateDevices(): void {
    const body = this.lastRequestBody || this.getRequestBody();

    this.isUpdatingSilently.set(true);

    this.devicesService
      .getAllDevices(body)
      .pipe(
        take(1),
        finalize(() => {
          this.isUpdatingSilently.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this._data.set(response.data.items || []);
          this._totalItems.set(response.data.totalItemsCount || 0);
        },
      });
  }

  private forceSearchDevices(): void {
    this.lastRequestBody = null;
    this.searchDevices();
  }

  private getRequestBody(): TSearchDevicesRequest {
    const sortBy = this.SORT_MAPPER[this.sortData?.sortBy || ''] ?? null;
    const formData: TOptional<TSearchDevicesFormValue> = this.formData ?? {};
    const { status, time, customTime, enrollmentDate, ...searchFields } = formData;

    const requestBody: TSearchDevicesRequest = {
      ...searchFields,
      value: this.searchTerm ?? null,
      pageNum: this.pageData.pageIndex + 1,
      pageSize: this.pageData.pageSize,
      sortBy,
      sortDir: this.sortData?.sortDir || 'asc',
      enrollmentDateFrom: enrollmentDate?.start
        ? new Date(enrollmentDate.start).toISOString()
        : null,
      enrollmentDateTo: enrollmentDate?.end ? new Date(enrollmentDate.end).toISOString() : null,
      androidVersion: formData.androidVersion || null,
      launcherVersion: formData.launcherVersion || null,
      ...this.getOnlineStatusParams(status, time, customTime),
    };

    return requestBody;
  }

  private getOnlineStatusParams(
    status: string | null | undefined,
    time: string | null | undefined,
    customTime: string | null | undefined,
  ): Pick<TSearchDevicesRequest, 'onlineLaterMillis' | 'onlineEarlierMillis'> {
    const minutes = time === CUSTOM_TIME_VALUE ? Number(customTime) : Number(time);

    if (!status || !time || !minutes || minutes <= 0) {
      return { onlineLaterMillis: null, onlineEarlierMillis: null };
    }

    const millis = minutes * 60_000;

    return status === DEVICE_ONLINE_STATUS.ONLINE
      ? { onlineLaterMillis: millis, onlineEarlierMillis: null }
      : { onlineLaterMillis: null, onlineEarlierMillis: millis };
  }

  private groupsToOption(response: TGroup[]): TOption<number>[] {
    return response.map((group) => ({ value: group.id, viewValue: group.name }));
  }

  private configurationsToOption(response: TConfiguration[]): TOption<number>[] {
    return response.map((config) => ({ value: config.id, viewValue: config.name }));
  }
}
