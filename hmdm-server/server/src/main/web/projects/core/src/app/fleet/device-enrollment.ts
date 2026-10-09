import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FleetApi } from './fleet-api';

@Component({
  selector: 'core-device-enrollment',
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule, MatTooltipModule],
  styleUrl: './fleet.scss',
  template: `
    <div class="toolbar"><h1>Device enrollment</h1><button mat-icon-button (click)="load()" matTooltip="Refresh" aria-label="Refresh" [disabled]="busy"><mat-icon>refresh</mat-icon></button></div>
    @if (error) { <p class="error" role="alert">{{error}}</p> }
    @if (notice) { <p class="notice" role="status">{{notice}}</p> }
    <h2>{{form.id ? 'Edit numbering rule' : 'New numbering rule'}}</h2>
    <form (ngSubmit)="save()" #ruleForm="ngForm">
      <div class="fields inline-form enrollment-fields">
        <mat-form-field floatLabel="always"><mat-label>Group</mat-label><mat-select name="group" [(ngModel)]="form.groupId"><mat-option [value]="0">New group</mat-option>@for (g of groups; track g.id) { <mat-option [value]="g.id">{{g.name}}</mat-option> }</mat-select></mat-form-field>
        @if (!form.groupId) { <mat-form-field floatLabel="always"><mat-label>New group name</mat-label><input matInput name="groupName" [(ngModel)]="groupName" required></mat-form-field> }
        <mat-form-field floatLabel="always"><mat-label>Configuration</mat-label><mat-select name="configuration" [(ngModel)]="form.configurationId" required>@for (c of configurations; track c.id) { <mat-option [value]="c.id">{{c.name}}</mat-option> }</mat-select></mat-form-field>
        <mat-form-field floatLabel="always"><mat-label>Prefix</mat-label><input matInput name="prefix" [(ngModel)]="form.prefix" required pattern="[A-Za-z0-9_-]+"></mat-form-field>
        <mat-form-field class="short-field"><mat-label>Digits</mat-label><input matInput type="number" name="digits" min="1" max="9" [(ngModel)]="form.digits" required></mat-form-field>
        <mat-form-field class="sequence-field"><mat-label>Next sequence</mat-label><input matInput type="number" name="nextSeq" min="1" [(ngModel)]="form.nextSeq" required></mat-form-field>
        <mat-checkbox name="enabled" [(ngModel)]="form.enabled">Enabled</mat-checkbox>
        <button mat-flat-button class="field-button" type="submit" [disabled]="busy || ruleForm.invalid"><mat-icon>save</mat-icon>Save rule</button>
        <button mat-icon-button type="button" (click)="reset()" [disabled]="busy" aria-label="Clear numbering rule" matTooltip="Clear numbering rule"><mat-icon>close</mat-icon></button>
      </div>
      <p>Next number: <strong>{{nextNumber(form)}}</strong></p>
    </form>
    <div class="table-wrap"><table><thead><tr><th>Group</th><th>Configuration</th><th>Next number</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      @for (rule of rules; track rule.id) { <tr><td>{{rule.groupName}}</td><td>{{rule.configurationName}}</td><td>{{nextNumber(rule)}}</td><td>{{rule.enabled ? 'Enabled' : 'Disabled'}}</td><td>
        <button mat-icon-button (click)="edit(rule)" matTooltip="Edit rule" aria-label="Edit rule" [disabled]="busy"><mat-icon>edit</mat-icon></button>
        <button mat-icon-button (click)="selected = rule; qrFailed = false" matTooltip="Enrollment QR code" aria-label="Enrollment QR code" [disabled]="!rule.mainAppId"><mat-icon>qr_code</mat-icon></button>
        <button mat-icon-button (click)="remove(rule)" matTooltip="Delete rule" aria-label="Delete rule" [disabled]="busy"><mat-icon>delete</mat-icon></button>
      </td></tr> } @empty { <tr><td colspan="5">No numbering rules.</td></tr> }
    </tbody></table></div>
    @if (selected) { <h2>{{selected.groupName}}</h2><img class="qr" [src]="qrUrl(selected)" alt="Group enrollment QR code" (error)="qrFailed = true">
      @if (qrFailed) { <p class="error">QR code unavailable. Check the configuration's main application and uploaded launcher APK.</p> }
      <button mat-button (click)="selected = null">Close</button> }
    <h2>Assigned numbers</h2><div class="table-wrap"><table><thead><tr><th>Original number</th><th>Assigned number</th><th>Assigned</th></tr></thead><tbody>
      @for (row of assignments; track row.deviceId) { <tr><td>{{row.originalNumber}}</td><td>{{row.assignedNumber}}</td><td>{{row.assignTime | date:'medium'}}</td></tr> }
      @empty { <tr><td colspan="3">No assignments.</td></tr> }
    </tbody></table></div>`,
})
export class DeviceEnrollment implements OnInit {
  private readonly api = inject(FleetApi);
  rules: any[] = []; assignments: any[] = []; groups: any[] = []; configurations: any[] = [];
  form: any = this.empty(); selected: any = null; groupName = ''; error = ''; notice = ''; busy = false; qrFailed = false;
  ngOnInit() { void this.load(); }
  empty() { return {id: null, groupId: 0, configurationId: null, prefix: '', digits: 3, nextSeq: 1, enabled: true}; }
  reset() { this.form = this.empty(); this.groupName = ''; }
  edit(rule: any) { this.form = {...rule}; this.groupName = ''; }
  nextNumber(rule: any) { return (rule.prefix || '').toUpperCase() + String(rule.nextSeq || 1).padStart(Math.min(9, Math.max(1, rule.digits || 3)), '0'); }
  qrUrl(rule: any) { return `rest/public/qr/${encodeURIComponent(rule.qrCodeKey)}?create=1&group=${rule.groupId}&useId=serial&size=260`; }
  async load() {
    this.busy = true; this.error = '';
    try { [this.rules, this.assignments, this.groups, this.configurations] = await Promise.all([
      'plugins/deviceenroll/private/rules', 'plugins/deviceenroll/private/assignments', 'private/groups/search', 'private/configurations/search',
    ].map(path => this.api.request<any[]>(path))); }
    catch (e) { this.error = e instanceof Error ? e.message : 'Could not load enrollment.'; }
    finally { this.busy = false; }
  }
  async save() {
    if (this.busy) return;
    const existing = this.rules.find(r => r.groupId === this.form.groupId && r.id !== this.form.id);
    if (existing && !window.confirm(`Replace the numbering rule for ${existing.groupName}?`)) return;
    this.busy = true; this.error = ''; this.notice = '';
    try { await this.api.request(`plugins/deviceenroll/private/rules?groupName=${encodeURIComponent(this.groupName)}&overwrite=${!!existing}`, 'POST', {...this.form, prefix: this.form.prefix.toUpperCase()}); this.reset(); await this.load(); this.notice = 'Numbering rule saved.'; }
    catch (e) { this.error = e instanceof Error ? e.message : 'Could not save rule.'; }
    finally { this.busy = false; }
  }
  async remove(rule: any) {
    if (!window.confirm(`Delete the numbering rule for ${rule.groupName}? Existing device numbers will be retained.`)) return;
    this.busy = true;
    try { await this.api.request(`plugins/deviceenroll/private/rules/${rule.id}`, 'DELETE'); this.selected = null; await this.load(); }
    catch (e) { this.error = e instanceof Error ? e.message : 'Could not delete rule.'; }
    finally { this.busy = false; }
  }
}
