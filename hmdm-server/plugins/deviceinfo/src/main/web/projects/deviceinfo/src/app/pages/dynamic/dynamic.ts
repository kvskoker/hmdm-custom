import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  MatCardHeader,
  MatCardModule,
  MatExpansionModule,
  TranslatePipe,
  MatSelectModule,
  MatAnchor,
  MatIcon,
  BaseComponent,
  LoaderDirective,
} from 'hmdm-ui-kit';
import { DynamicTable } from '../../components/dynamic-table/dynamic-table';
import { DetailsFacadeService } from '../../services/details-facade.service';
import { DisplayedColumns } from '../../components/displayed-columns/displayed-columns';
import { SearchForm } from '../../components/search-form/search-form';
import { SearchFormConfig } from '../../config/search-form.config';

@Component({
  selector: 'di-dynamic',
  templateUrl: './dynamic.html',
  styleUrl: './dynamic.scss',
  imports: [
    MatCardHeader,
    TranslatePipe,
    MatCardModule,
    DynamicTable,
    MatExpansionModule,
    DisplayedColumns,
    MatSelectModule,
    SearchForm,
    MatAnchor,
    MatIcon,
    LoaderDirective,
  ],
})
export class Dynamic extends BaseComponent implements OnInit {
  @ViewChild('table') table!: DynamicTable;

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly detailsFacadeService = inject(DetailsFacadeService);
  private readonly searchFormConfig = inject(SearchFormConfig);

  formGroup = this.searchFormConfig.getFormGroup();
  isLoadingDetails = this.detailsFacadeService.isLoadingDetails;

  ngOnInit(): void {
    const deviceName = this.activatedRoute.snapshot.paramMap.get('deviceName');
    deviceName && this.detailsFacadeService.setDeviceNumber(deviceName);

    this.formGroup.valueChanges.pipe(this.untilDestroyed()).subscribe(() => {
      this.detailsFacadeService.setForm(this.formGroup.getRawValue());
      this.table?.resetPagination();
    });
  }

  onExport(): void {
    this.detailsFacadeService.exportLogs();
  }
}
