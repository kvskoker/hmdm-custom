import { AfterViewInit, Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../shared/services/auth.service';
import { FleetApi } from './fleet-api';

@Component({
  selector: 'core-device-tracking',
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatTooltipModule],
  styleUrl: './fleet.scss',
  template: `
    <div class="toolbar"><h1>Device tracking</h1><button mat-icon-button (click)="load()" [disabled]="busy" matTooltip="Refresh locations" aria-label="Refresh locations"><mat-icon>refresh</mat-icon></button></div>
    @if (error) { <p class="error" role="alert">{{error}}</p> }
    @if (notice) { <p class="notice" role="status">{{notice}}</p> }
    <p>{{data.deviceCount || 0}} devices · {{data.devicesWithoutLocation || 0}} without a location · {{data.lost?.length || 0}} reported lost</p>
    <mat-form-field><mat-label>Search devices</mat-label><input matInput [(ngModel)]="search" (ngModelChange)="selected = null; draw()"></mat-form-field>
    <div #mapElement class="map" aria-label="Device locations map"></div>
    <div class="table-wrap"><table><thead><tr><th>Device</th><th>Configuration</th><th>Last location</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      @for (point of filtered; track point.deviceId) { <tr><td>{{point.deviceNumber}}</td><td>{{point.configurationName}}</td><td>{{point.ts ? (point.ts | date:'medium') : 'Not reported'}}</td><td>{{point.lost ? 'Lost' : 'Normal'}}</td><td>
        <button mat-icon-button (click)="history(point)" matTooltip="Location history" aria-label="Location history" [disabled]="busy"><mat-icon>route</mat-icon></button>
        @if (auth.hasPermission('plugin_devicelocation_lost')) { <button mat-button (click)="mark(point)" [disabled]="busy">{{point.lost ? 'Mark found' : 'Report lost'}}</button> }
      </td></tr> } @empty { <tr><td colspan="5">No matching devices.</td></tr> }
    </tbody></table></div>
    @if (selected) { <h2>{{selected.deviceNumber}}: location history</h2>
      <div class="actions"><button mat-button (click)="selected = null; draw()">All devices</button>
        @if (auth.hasPermission('plugin_devicelocation_lost')) { <button mat-button class="danger" (click)="clearHistory()" [disabled]="busy">Clear history</button> }</div>
      <div class="table-wrap"><table><thead><tr><th>Recorded</th><th>Latitude</th><th>Longitude</th><th>While lost</th></tr></thead><tbody>
        @for (point of trail; track point.id) { <tr><td>{{point.ts | date:'medium'}}</td><td>{{point.lat}}</td><td>{{point.lon}}</td><td>{{point.whileLost ? 'Yes' : 'No'}}</td></tr> }
        @empty { <tr><td colspan="4">No recorded positions.</td></tr> }
      </tbody></table></div> }
    @if (auth.hasPermission('plugin_devicelocation_settings') && settings) {
      <h2>Tracking settings</h2><form (ngSubmit)="saveSettings()" #settingsForm="ngForm"><div class="fields inline-form tracking-fields">
        <mat-checkbox name="trackAll" [(ngModel)]="settings.trackAllDevices">Track all devices</mat-checkbox>
        <mat-form-field><mat-label>Positions retained per device</mat-label><input matInput type="number" min="1" name="keep" [(ngModel)]="settings.keepPoints" required></mat-form-field>
        <mat-form-field><mat-label>Normal interval (minutes)</mat-label><input matInput type="number" min="1" name="normal" [(ngModel)]="settings.normalIntervalMins" required></mat-form-field>
        <mat-form-field><mat-label>Lost interval (minutes)</mat-label><input matInput type="number" min="1" name="lost" [(ngModel)]="settings.lostIntervalMins" required></mat-form-field>
        <button mat-flat-button class="field-button" type="submit" [disabled]="busy || settingsForm.invalid"><mat-icon>save</mat-icon>Save settings</button>
      </div></form>
    }`,
})
export class DeviceTracking implements AfterViewInit, OnDestroy {
  readonly auth = inject(AuthService);
  private readonly api = inject(FleetApi);
  @ViewChild('mapElement') mapElement!: ElementRef<HTMLElement>;
  data: any = {}; settings: any = null; selected: any = null; trail: any[] = [];
  search = ''; error = ''; notice = ''; busy = false;
  private map: any; private layer: any; private tile: any; private L: any; private destroyed = false;
  private timer?: ReturnType<typeof setInterval>;
  get filtered(): any[] { return (this.data.points || []).filter((p: any) => p.deviceNumber.toLowerCase().includes(this.search.toLowerCase())); }
  async ngAfterViewInit() {
    try {
      if (!(window as any).L) {
        const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'assets/leaflet/leaflet.css'; document.head.appendChild(css);
        await new Promise<void>((resolve, reject) => { const script = document.createElement('script'); script.src = 'assets/leaflet/leaflet.js'; script.onload = () => resolve(); script.onerror = () => reject(new Error('Map library could not be loaded.')); document.head.appendChild(script); });
      }
      if (this.destroyed) return;
      this.L = (window as any).L; this.map = this.L.map(this.mapElement.nativeElement).setView([8.46, -11.78], 7); this.layer = this.L.featureGroup().addTo(this.map);
      await this.load();
      if (this.auth.hasPermission('plugin_devicelocation_settings')) this.settings = await this.api.request('plugins/devicelocation/private/settings');
      this.timer = setInterval(() => { if (!this.busy && !this.selected) void this.load(false); }, 30000);
    } catch (e) { this.error = e instanceof Error ? e.message : 'Could not load map.'; }
  }
  ngOnDestroy() { this.destroyed = true; clearInterval(this.timer); this.map?.remove(); }
  async load(fit = true) {
    this.busy = true; this.error = '';
    try { this.data = await this.api.request('plugins/devicelocation/private/map'); if (!this.destroyed) this.draw(fit); }
    catch (e) { this.error = e instanceof Error ? e.message : 'Could not load locations.'; }
    finally { this.busy = false; }
  }
  draw(fit = true) {
    if (!this.map || this.destroyed) return;
    if (!this.tile) this.tile = this.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '&copy; OpenStreetMap contributors', maxZoom: 19}).addTo(this.map);
    this.layer.clearLayers();
    const points = this.selected ? this.trail : this.filtered;
    const positions: number[][] = [];
    for (const p of points) {
      if (p.lat == null || p.lon == null) continue;
      positions.push([p.lat, p.lon]);
      const label = document.createElement('span'); label.textContent = `${p.deviceNumber || this.selected?.deviceNumber}: ${new Date(p.ts).toLocaleString()}`;
      this.L.circleMarker([p.lat, p.lon], {radius: 7, color: p.lost || p.whileLost ? '#b4232d' : '#12715c'}).bindPopup(label).addTo(this.layer);
    }
    if (this.selected && positions.length > 1) this.L.polyline(positions, {color: '#12715c'}).addTo(this.layer);
    if (fit && positions.length) this.map.fitBounds(this.layer.getBounds(), {padding: [24,24], maxZoom: 15});
  }
  async history(point: any) {
    this.busy = true; this.error = '';
    try { const result = await this.api.request(`plugins/devicelocation/private/device/${encodeURIComponent(point.deviceNumber)}`); this.selected = point; this.trail = result.points; this.draw(); }
    catch (e) { this.error = e instanceof Error ? e.message : 'Could not load history.'; }
    finally { this.busy = false; }
  }
  async mark(point: any) {
    const note = point.lost ? '' : window.prompt(`Report ${point.deviceNumber} lost. Add a note:`, '');
    if (note === null || (point.lost && !window.confirm(`Mark ${point.deviceNumber} found?`))) return;
    this.busy = true;
    try { await this.api.request(`plugins/devicelocation/private/${point.lost ? 'found' : 'lost'}/${encodeURIComponent(point.deviceNumber)}`, 'POST', {note}); this.selected = null; await this.load(false); }
    catch (e) { this.error = e instanceof Error ? e.message : 'Could not update lost status.'; }
    finally { this.busy = false; }
  }
  async clearHistory() {
    if (!window.confirm(`Delete location history for ${this.selected.deviceNumber}?`)) return;
    this.busy = true;
    try { await this.api.request(`plugins/devicelocation/private/device/${encodeURIComponent(this.selected.deviceNumber)}`, 'DELETE'); this.selected = null; this.trail = []; await this.load(); }
    catch (e) { this.error = e instanceof Error ? e.message : 'Could not clear history.'; }
    finally { this.busy = false; }
  }
  async saveSettings() {
    this.busy = true;
    try { await this.api.request('plugins/devicelocation/private/settings', 'PUT', this.settings); this.notice = 'Tracking settings saved.'; await this.load(false); }
    catch (e) { this.error = e instanceof Error ? e.message : 'Could not save tracking settings.'; }
    finally { this.busy = false; }
  }
}
