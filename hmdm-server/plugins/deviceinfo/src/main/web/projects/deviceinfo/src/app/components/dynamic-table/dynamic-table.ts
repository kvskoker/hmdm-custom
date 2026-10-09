import { Component, effect, inject, signal, ViewChild, WritableSignal } from '@angular/core';
import { DatetimeCell, PageEvent, Table, TTableConfig } from 'hmdm-ui-kit';
import { DynamicTableConfig } from '../../config/dynamic-table.config';
import { DetailsFacadeService } from '../../services/details-facade.service';
import { FieldsSelectionService } from '../../services/fields-selection.service';

@Component({
  selector: 'di-dynamic-table',
  templateUrl: './dynamic-table.html',
  styleUrl: './dynamic-table.scss',
  imports: [Table],
})
export class DynamicTable {
  @ViewChild('table') table!: Table<unknown>;

  private readonly detailsFacadeService = inject(DetailsFacadeService);
  private readonly dynamicTableConfig = inject(DynamicTableConfig);
  private readonly fieldsSelectionService = inject(FieldsSelectionService);

  tableConfig: WritableSignal<TTableConfig> = signal(this.dynamicTableConfig.getConfig());
  tableData = this.detailsFacadeService.dynamic;
  totalItemsCount = this.detailsFacadeService.dynamicTotalCount;

  constructor() {
    effect(() => {
      const selectedFields = this.fieldsSelectionService.fieldsSelection();
      const keys = Object.keys(selectedFields).filter((key) => selectedFields[key]);

      this.tableConfig.update((config) => {
        return {
          ...this.dynamicTableConfig.getConfig(),
          columns: [
            {
              field: 'latestUpdateTime',
              title: 'plugin.deviceinfo.title.time',
              cellRenderer: DatetimeCell,
              cellRendererParams: {
                timeFormat: 'dd.MM.yyyy HH:mm:ss',
              },
            },
            ...keys.map((key) => ({
              field: key,
              title: 'plugin.deviceinfo.title.group.' + key,
            })),
          ],
          paginator: config.paginator,
        };
      });
    });
  }

  onPageChange($event: PageEvent): void {
    this.detailsFacadeService.updatePage($event);
  }

  resetPagination(): void {
    this.table.resetPagination();
  }
}
