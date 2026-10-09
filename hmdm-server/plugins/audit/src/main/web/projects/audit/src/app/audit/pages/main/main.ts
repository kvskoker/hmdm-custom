import { Component, inject, AfterViewInit, OnInit, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  BaseComponent,
  LoaderDirective,
  MatButtonModule,
  MatCardModule,
  MatDividerModule,
  SearchContainer,
  TranslatePipe,
} from 'hmdm-ui-kit';
import { AuditForm } from '../../components/audit-form/audit-form';
import { AuditTable } from '../../components/audit-table/audit-table';
import { AuditFormConfig } from '../../configuration/audit-form.config';
import { AuditTableConfig } from '../../configuration/audit-table.config';
import { AuditFacadeService } from '../../services/audit-facade.service';
import { AuditService } from '../../services/audit.service';
import { AuditDialogService } from '../../services/audit-dialog.service';
import { TAuditFormValue } from '../../types/audit-form.type';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'audit-main',
  templateUrl: './main.html',
  styleUrl: './main.scss',
  providers: [
    AuditService,
    AuditFacadeService,
    AuditFormConfig,
    AuditTableConfig,
    AuditDialogService,
  ],
  imports: [
    MatCardModule,
    LoaderDirective,
    SearchContainer,
    TranslatePipe,
    MatDividerModule,
    MatButtonModule,
    AuditForm,
    AuditTable,
  ],
})
export class Main extends BaseComponent implements OnInit, AfterViewInit {
  private readonly auditFacadeService = inject(AuditFacadeService);
  private readonly auditFormConfig = inject(AuditFormConfig);

  tableSearchControl: FormControl<string> = new FormControl('', { nonNullable: true });
  formGroup: FormGroup = this.auditFormConfig.getFormGroup();
  isLoadingAudits = this.auditFacadeService.isLoadingAudits;
  activeFiltersCount: WritableSignal<number> = signal(0);

  ngOnInit(): void {
    this.tableSearchControl.valueChanges
      .pipe(this.untilDestroyed(), debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.auditFacadeService.setUserFilter(this.tableSearchControl.value));

    this.formGroup.valueChanges.pipe(this.untilDestroyed()).subscribe(() => {
      const value: TAuditFormValue = this.formGroup.getRawValue();
      let cnt = 0;

      if (value.messageFilter) cnt++;
      if (value.date?.start || value.date?.end) cnt++;

      this.activeFiltersCount.set(cnt);
      this.auditFacadeService.updateFormValue(value);
    });
  }

  ngAfterViewInit(): void {
    this.auditFacadeService.setUserFilter(this.tableSearchControl.value);
    this.auditFacadeService.initialize();
  }
}
