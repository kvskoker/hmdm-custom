import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { AuthService } from '../shared/services/auth.service';
import { FleetApi } from './fleet-api';

@Component({
  selector: 'core-device-management',
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatTooltipModule, MatTabsModule, MatPaginatorModule],
  styleUrl: './fleet.scss',
  template: `
    <div class="toolbar"><h1>Device management</h1>
      <button mat-icon-button matTooltip="Refresh history" aria-label="Refresh history" (click)="load()" [disabled]="busy"><mat-icon>refresh</mat-icon></button></div>
    @if (error) { <p class="error" role="alert">{{error}}</p> }
    @if (notice) { <p class="notice" role="status">{{notice}}</p> }
    @if (pin) { <p class="notice" role="status">New PIN: <strong>{{pin}}</strong>
      <button mat-button (click)="pin = ''">Dismiss</button></p> }
    <div class="fields search-fields">
      <mat-form-field><mat-label>Device number, IMEI or serial</mat-label><input matInput [(ngModel)]="number" [disabled]="busy" (ngModelChange)="clearSelection()" (keyup.enter)="lookup()"></mat-form-field>
      <button mat-stroked-button class="field-button" (click)="lookup()" [disabled]="busy || !number.trim()"><mat-icon>search</mat-icon>Find device</button>
    </div>
    @if (searched && !status) {
      <div class="table-wrap"><table aria-label="Matching devices"><thead><tr><th>Device</th><th>IMEI</th><th>Serial</th><th>Description</th><th></th></tr></thead><tbody>
        @for (device of matches; track device.id) { <tr><td>{{device.number}}</td><td>{{device.imei || device.info?.imei || '-'}}</td><td>{{device.serial || '-'}}</td><td>{{device.description}}</td><td><button mat-button (click)="selectDevice(device.number)" [disabled]="busy">Select</button></td></tr> }
        @empty { <tr><td colspan="5">No matching devices.</td></tr> }
      </tbody></table></div>
      <mat-paginator aria-label="Device search pagination" [length]="matchCount" [pageIndex]="matchPage" [pageSize]="10" (page)="lookup($event.pageIndex)" showFirstLastButtons></mat-paginator>
    }
    @if (status) {
      <p><strong>{{status.deviceNumber}}</strong> · {{status.locked ? 'Locked' : 'Unlocked'}} · Last sync: {{status.lastUpdate ? (status.lastUpdate | date:'medium') : 'Not reported'}}</p>
      <div class="actions">
        <button mat-stroked-button (click)="choose('reset')" [disabled]="busy"><mat-icon>password</mat-icon>Reset password</button>
        <button mat-stroked-button (click)="choose('reboot')" [disabled]="busy"><mat-icon>restart_alt</mat-icon>Reboot</button>
        <button mat-stroked-button (click)="choose(status.locked ? 'unlock' : 'lock')" [disabled]="busy"><mat-icon>lock</mat-icon>{{status.locked ? 'Unlock' : 'Lock'}}</button>
        @if (auth.hasPermission('plugin_devicereset_wipe')) {
          <button mat-stroked-button class="danger" (click)="choose('factoryreset')" [disabled]="busy"><mat-icon>delete_forever</mat-icon>Wipe device</button>
        }
      </div>
    }
    @if (action) {
      <h2>{{actionTitle}}</h2>
      @if (action === 'factoryreset') { <p class="danger">This permanently erases the device. Retype {{status.deviceNumber}} to confirm.</p>
        <mat-form-field><mat-label>Confirm device number</mat-label><input matInput autocomplete="off" [(ngModel)]="confirmation"></mat-form-field> }
      @if (action === 'reset') { <mat-form-field><mat-label>PIN length</mat-label><input matInput type="number" min="4" max="16" [(ngModel)]="pinLength"></mat-form-field> }
      @if (action === 'lock') { <mat-form-field><mat-label>Lock message</mat-label><textarea matInput [(ngModel)]="message"></textarea></mat-form-field> }
      <div class="actions"><button mat-flat-button (click)="execute()" [disabled]="busy || (action === 'factoryreset' && confirmation !== status.deviceNumber) || (action === 'reset' && (pinLength < 4 || pinLength > 16))">Confirm {{actionTitle.toLowerCase()}}</button>
      <button mat-button (click)="action = ''" [disabled]="busy">Cancel</button></div>
    }
    <section class="history" aria-label="Device history">
      <mat-tab-group [selectedIndex]="historyTab" (selectedIndexChange)="changeTab($event)">
        <mat-tab label="Password resets"></mat-tab><mat-tab label="Reboot and wipe requests"></mat-tab><mat-tab label="Locked devices"></mat-tab>
      </mat-tab-group>
      <div class="fields history-filters">
        <mat-form-field><mat-label>Search history</mat-label><input matInput [(ngModel)]="historySearch" (ngModelChange)="filterHistory(true)"></mat-form-field>
        @if (historyTab !== 2) { <mat-form-field><mat-label>Status</mat-label><mat-select [(ngModel)]="historyStatus" (selectionChange)="filterHistory()">
          <mat-option value="">All statuses</mat-option><mat-option value="0">Pending</mat-option><mat-option value="1">Delivered</mat-option><mat-option value="2">{{historyTab === 1 ? 'Acknowledged' : 'Confirmed'}}</mat-option>
        </mat-select></mat-form-field> }
        @if (historyTab === 1) { <mat-form-field><mat-label>Command</mat-label><mat-select [(ngModel)]="historyCommand" (selectionChange)="filterHistory()">
          <mat-option value="">All commands</mat-option><mat-option value="reboot">Reboot</mat-option><mat-option value="factoryreset">Wipe</mat-option>
        </mat-select></mat-form-field> }
        <mat-form-field><mat-label>Period</mat-label><mat-select [(ngModel)]="historyDays" (selectionChange)="filterHistory()">
          <mat-option [value]="0">All time</mat-option><mat-option [value]="1">Last 24 hours</mat-option><mat-option [value]="7">Last 7 days</mat-option><mat-option [value]="30">Last 30 days</mat-option>
        </mat-select></mat-form-field>
        <button mat-icon-button aria-label="Clear history filters" matTooltip="Clear history filters" (click)="resetFilters()"><mat-icon>filter_alt_off</mat-icon></button>
      </div>
      @if (historyError) { <p class="error" role="alert">{{historyError}}</p> }
      <div class="table-wrap"><table class="history-table" aria-label="History records" [attr.aria-busy]="historyLoading"><thead><tr>
        <th>Device</th>@if (historyTab === 1) { <th>Command</th> }<th>{{historyTab === 2 ? 'Updated' : 'Requested'}}</th><th>Requested by</th><th>{{historyTab === 2 ? 'Message' : 'Status'}}</th>@if (historyTab === 2) { <th></th> }
      </tr></thead><tbody>
        @for (row of historyRows; track row.id) { <tr><td>{{row.deviceNumber}}</td>@if (historyTab === 1) { <td>{{row.commandType === 'reboot' ? 'Reboot' : 'Wipe'}}</td> }
          <td>{{row.requestTime | date:'short'}}</td><td>{{row.requestedBy}}</td>
          <td>{{historyTab === 2 ? row.lockMessage : row.deviceCapable === false ? 'Device unable to wipe' : state(row.status, historyTab === 1)}}</td>
          @if (historyTab === 2) { <td><button mat-button (click)="selectDevice(row.deviceNumber)" [disabled]="busy">Manage</button></td> }
        </tr> } @empty { <tr><td colspan="6">{{historyLoading ? 'Loading history...' : 'No matching records.'}}</td></tr> }
      </tbody></table></div>
      <mat-paginator aria-label="History pagination" [length]="historyCount" [pageIndex]="historyPage" [pageSize]="historySize" [pageSizeOptions]="[10,25,50,100]" (page)="pageHistory($event)" showFirstLastButtons></mat-paginator>
    </section>`,
})
export class DeviceManagement implements OnInit, OnDestroy {
  readonly auth = inject(AuthService);
  private readonly api = inject(FleetApi);
  number = ''; confirmation = ''; message = ''; pin = ''; pinLength = 6;
  action = ''; error = ''; notice = ''; busy = false;
  status: any = null;
  matches: any[] = []; matchCount = 0; matchPage = 0; searched = false;
  historyRows: any[] = []; historyCount = 0; historyPage = 0; historySize = 10;
  historyTab = 0; historySearch = ''; historyStatus = ''; historyCommand = ''; historyDays = 0;
  historyLoading = false; historyError = '';
  private historyRequest = 0;
  private searchTimer?: ReturnType<typeof setTimeout>;
  private timer?: ReturnType<typeof setInterval>;
  get actionTitle() { return ({reset: 'Reset password', reboot: 'Reboot device', lock: 'Lock device', unlock: 'Unlock device', factoryreset: 'Wipe device'} as Record<string,string>)[this.action] || ''; }
  ngOnInit() { void this.load(); this.timer = setInterval(() => { if (!this.busy) void this.load(); }, 30000); }
  ngOnDestroy() { clearInterval(this.timer); clearTimeout(this.searchTimer); this.historyRequest++; this.pin = ''; }
  state(value: number, command = false) { return ['Pending', 'Delivered', command ? 'Acknowledged' : 'Confirmed'][value] || String(value); }
  choose(action: string) { this.action = action; this.confirmation = ''; this.pin = ''; this.notice = ''; }
  changeTab(index: number) { this.historyTab = index; this.historyRows = []; this.historyCount = 0; this.resetFilters(); }
  resetFilters() { this.historySearch = ''; this.historyStatus = ''; this.historyCommand = ''; this.historyDays = 0; this.filterHistory(); }
  filterHistory(debounce = false) {
    clearTimeout(this.searchTimer); this.historyRequest++; this.historyPage = 0;
    if (debounce) this.searchTimer = setTimeout(() => void this.load(), 300);
    else void this.load();
  }
  pageHistory(event: PageEvent) { this.historyPage = event.pageIndex; this.historySize = event.pageSize; void this.load(); }
  async load() {
    const request = ++this.historyRequest;
    this.historyLoading = true; this.historyError = '';
    const params = new URLSearchParams({kind: ['password','commands','locked'][this.historyTab], page: String(this.historyPage), size: String(this.historySize), search: this.historySearch.trim(), after: String(this.historyDays ? Date.now() - this.historyDays * 86400000 : 0)});
    if (this.historyTab !== 2 && this.historyStatus) params.set('status', this.historyStatus);
    if (this.historyTab === 1 && this.historyCommand) params.set('commandType', this.historyCommand);
    try {
      const result = await this.api.request(`plugins/devicereset/private/history/page?${params}`);
      if (request !== this.historyRequest) return;
      this.historyRows = result.items; this.historyCount = result.totalItemsCount;
      if (!this.historyRows.length && this.historyPage > 0) { this.historyPage = Math.max(0, Math.ceil(this.historyCount / this.historySize) - 1); await this.load(); }
    } catch (e) { if (request === this.historyRequest) { this.historyRows = []; this.historyCount = 0; this.historyError = e instanceof Error ? e.message : 'Could not load history.'; } }
    finally { if (request === this.historyRequest) this.historyLoading = false; }
  }
  clearSelection() { this.status = null; this.pin = ''; this.action = ''; this.matches = []; this.searched = false; }
  async lookup(page = 0) {
    if (this.busy || !this.number.trim()) return;
    this.busy = true; this.error = ''; this.clearSelection(); this.matchPage = page;
    try {
      const result = await this.api.request('private/devices/search', 'POST', {value: this.number.trim(), pageNum: page + 1, pageSize: 10, sortBy: 'NUMBER', sortDir: 'asc', fastSearch: false});
      this.matches = result.devices.items || []; this.matchCount = result.devices.totalItemsCount; this.searched = true;
      if (this.matchCount === 1) await this.selectDevice(this.matches[0].number);
    } catch (e) { this.error = e instanceof Error ? e.message : 'Could not search devices.'; }
    finally { this.busy = false; }
  }
  async selectDevice(number: string) {
    this.busy = true; this.error = ''; this.action = ''; this.status = null;
    this.pin = ''; this.notice = '';
    try { const status = await this.api.request(`plugins/devicereset/private/status/${encodeURIComponent(number)}`);
      if (!status.found) throw new Error('Device not found or access denied.'); this.status = status;
    } catch (e) { this.error = e instanceof Error ? e.message : 'Could not load device.'; }
    finally { this.busy = false; }
  }
  async execute() {
    if (this.busy || !this.status || !this.action) return;
    this.busy = true; this.error = ''; this.pin = '';
    const deviceNumber = this.status.deviceNumber;
    try { const result = await this.api.request(`plugins/devicereset/private/${this.action}`, 'POST', {
      deviceNumber, confirmDeviceNumber: this.confirmation, pinLength: this.pinLength, message: this.message,
    });
      this.pin = result?.pin || ''; this.notice = 'Request queued. Delivery requires the device to connect.';
      this.action = ''; await this.load();
      this.status = await this.api.request(`plugins/devicereset/private/status/${encodeURIComponent(deviceNumber)}`);
    } catch (e) { this.error = e instanceof Error ? e.message : 'The request failed. Refresh the history before retrying.'; }
    finally { this.busy = false; }
  }
}
