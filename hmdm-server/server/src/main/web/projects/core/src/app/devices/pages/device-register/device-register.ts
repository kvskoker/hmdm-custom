import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { DeviceRegisterService } from '../../services/device-register.service';

type Settings = { fields: string[]; inactiveDays: number };
type DeviceRow = {number: string; imei: string; phone: string; status: string; lastUpdate: number; configuration: string; values: Record<string,string>};
type Batch = {fields: string[]; rows: {number: string; values: Record<string,string>}[]};

@Component({
  selector: 'core-device-register',
  imports: [CommonModule, FormsModule, RouterLink, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatTooltipModule, MatCheckboxModule, MatPaginatorModule, HasPermissionDirective],
  styleUrl: './device-register.scss', templateUrl: './device-register.html',
})
export class DeviceRegister implements OnInit {
  private api = inject(DeviceRegisterService);
  private route = inject(ActivatedRoute);
  settings: Settings = {fields: [], inactiveDays: 30};
  draft: Settings = {fields: [], inactiveDays: 30};
  rows: DeviceRow[] = []; total=0; page=0; size=25;
  search=''; field=''; value=''; monitoring=''; newField='';
  busy=false; error=''; notice=''; showSettings=false;
  edit: {number: string; values: Record<string,string>} | null = null;
  preview: Batch | null = null; previewPage=0; confirm=false;
  async ngOnInit() {
    this.search = this.route.snapshot.queryParamMap.get('q') || '';
    await this.run(async () => { this.settings=await this.api.request<Settings>('settings'); this.resetSettings(); await this.load(); });
  }
  filters() { return {value: this.search || null, assignmentField: this.field || null,
    assignmentValue: this.field ? this.value : null, inactive: this.monitoring ? this.monitoring === 'inactive' : null,
    pageNum: this.page+1, pageSize: this.size, sortBy:'NUMBER', sortDir:'ASC'}; }
  async run(work: () => Promise<void>) {
    if (this.busy) return; this.busy=true; this.error=''; this.notice='';
    try { await work(); } catch(e) { this.error=this.api.error(e); } finally { this.busy=false; }
  }
  async load() { const found=await this.api.request<{items:DeviceRow[];total:number}>('search', this.filters()); this.rows=found.items; this.total=found.total; }
  find() { this.page=0; void this.run(() => this.load()); }
  clear() { this.search='';this.field='';this.value='';this.monitoring='';this.find(); }
  paginate(e: PageEvent) { this.page=e.pageIndex;this.size=e.pageSize;void this.run(() => this.load()); }
  export() { void this.run(() => this.api.export(this.filters())); }
  status(row: DeviceRow) { return !row.lastUpdate ? 'Never connected' : row.status==='red' ? 'Inactive' : row.status==='green' ? 'Recently connected' : 'Within policy'; }
  startEdit(row: DeviceRow) { this.edit={number:row.number,values:Object.fromEntries(this.settings.fields.map(f=>[f,row.values[f]||'']))}; }
  saveEdit() { const row=this.edit; if (!row) return; void this.run(async()=> { await this.api.request('save',{fields:this.settings.fields,rows:[row]}); this.edit=null;await this.load();this.notice='Assignment saved.'; }); }
  resetSettings() { this.draft={...this.settings,fields:[...this.settings.fields]}; }
  addField() { const name=this.newField.trim(); if(name && !this.draft.fields.some(f=>f.toLowerCase()===name.toLowerCase()) && this.draft.fields.length<30) {this.draft.fields.push(name);this.newField='';} }
  saveSettings() { void this.run(async()=> { this.settings=await this.api.request<Settings>('settings',this.draft);this.resetSettings();this.preview=null;this.edit=null;this.field='';this.value='';this.page=0;await this.load();this.showSettings=false;this.notice='Fields and inactivity policy saved.'; }); }
  importFile(event: Event) {
    const input=event.target as HTMLInputElement;const file=input.files?.[0];input.value='';if(!file)return;
    if(!file.name.toLowerCase().endsWith('.xlsx')||file.size>5*1024*1024){this.error='Select an .xlsx workbook no larger than 5 MB.';return;}
    this.preview=null;this.confirm=false;
    void this.run(async()=>{this.preview=await this.api.request<Batch>('preview',file);this.previewPage=0;});
  }
  apply() { if(!this.preview||!this.confirm)return;const batch=this.preview;void this.run(async()=>{const result=await this.api.request<{updated:number}>('save',batch);this.preview=null;await this.load();this.notice=`Updated ${result.updated} devices.`;}); }
}
