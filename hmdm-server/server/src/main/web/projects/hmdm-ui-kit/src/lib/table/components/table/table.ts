import { NgComponentOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  OnInit,
  output,
  OutputEmitterRef,
  signal,
  Signal,
  WritableSignal,
  InputSignal,
  effect,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { TColumnConfig } from '../../types/column-config.type';
import { TTableConfig } from '../../types/table-config.type';
import { TTableSortState } from '../../types/table-sort-state.type';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'hmdm-table',
  templateUrl: './table.html',
  styleUrl: './table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    NgComponentOutlet,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    TranslatePipe,
  ],
})
export class Table<T = any> implements OnInit {
  sortChange: OutputEmitterRef<TTableSortState | null> = output();
  pageChange: OutputEmitterRef<PageEvent> = output();
  selectionChange: OutputEmitterRef<T[]> = output();

  config: InputSignal<TTableConfig<T>> = input.required<TTableConfig<T>>();
  data: InputSignal<T[]> = input.required<T[]>();
  totalItems: InputSignal<number> = input<number>(0);

  defaultPageSizeOptions = [5, 10, 20];
  defaultPageSize = 10;
  currentPageIndex: WritableSignal<number> = signal(0);
  currentPageSize: WritableSignal<number> = signal(this.defaultPageSize);
  selection = new SelectionModel<T>(true, []);

  private sortState: WritableSignal<TTableSortState[]> = signal([]);

  /** Rows exposed to the template — sorted locally when client-side mode is active. */
  sortedData: Signal<T[]> = computed(() => {
    const sortState = this.sortState();
    if (!this.isClientSideSort) return this.data();
    return this.applySortLocally(this.data(), sortState);
  });

  /**
   * Client-side mode is active when no paginator is configured.
   * In this mode sorting is applied locally and no sortChange events are emitted.
   */
  get isClientSideSort(): boolean {
    return !this.config().paginator;
  }

  get displayedColumns(): string[] {
    const columns = this.config().columns.map((col: TColumnConfig) => this.getColumnDef(col));

    if (this.config().selector) {
      columns.unshift('select');
    }

    return columns;
  }

  constructor() {
    effect(() => {
      const config = this.config();

      this.initializeSortState();
    });
  }

  ngOnInit(): void {
    const config = this.config();

    if (config.paginator?.pageSize) {
      this.currentPageSize.set(config.paginator.pageSize);
    }

    if (!this.isClientSideSort) {
      this.sortChange.emit(null);
    }

    this.selection.changed.subscribe(() => {
      this.selectionChange.emit(this.selection.selected);
    });
  }

  onPageChange($event: PageEvent): void {
    this.selection.clear();
    this.currentPageIndex.set($event.pageIndex);
    this.currentPageSize.set($event.pageSize);
    this.pageChange.emit($event);
  }

  onChangeSort(column: TColumnConfig): void {
    this.selection.clear();
    const columnDef = this.getColumnDef(column);
    const currentSort = this.sortState().find((s) => s.sortBy === columnDef);
    let newDirection: TTableSortState['sortDir'] = 'asc';

    if (currentSort?.sortDir === 'asc') {
      newDirection = 'desc';
    } else if (currentSort?.sortDir === 'desc') {
      newDirection = null;
    }

    this.sortState.set(
      this.sortState().map((s) =>
        s.sortBy === columnDef ? { ...s, sortDir: newDirection } : { ...s, sortDir: null },
      ),
    );

    if (!this.isClientSideSort) {
      this.currentPageIndex.set(0);
      this.sortChange.emit(
        newDirection
          ? {
              sortBy: columnDef,
              sortDir: newDirection,
            }
          : null,
      );
    }
  }

  getSortIcon(columnDef: string): string {
    const sort = this.sortState().find((s) => s.sortBy === columnDef);

    if (sort?.sortDir === 'asc') {
      return 'arrow_upward';
    } else if (sort?.sortDir === 'desc') {
      return 'arrow_downward';
    }
    return 'unfold_more';
  }

  getColumnDef(column: TColumnConfig<T>): string {
    return (column.field as string) || column.title.toLowerCase().replace(/\s+/g, '_');
  }

  getFieldValue(data: T, field?: any): any {
    return this.getNestedValue(data, field) || '';
  }

  getCellRendererInputs(data: T, column: TColumnConfig<T>, rowIndex: number) {
    return {
      params: {
        data,
        value: column.field ? data[column.field] : null,
        rowIndex,
        column,
        provided: {
          ...column.cellRendererParams,
        },
      },
    };
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.data().length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.data());
  }

  resetPagination(): void {
    this.currentPageIndex.set(0);
  }

  trackByFn = (index: number, item: T): any => {
    const trackBy = this.config().trackBy;
    if (!trackBy) return index;
    if (typeof trackBy === 'function') return trackBy(index, item);
    return (item as any)[trackBy as string];
  };

  private applySortLocally(data: T[], sortState: TTableSortState[]): T[] {
    const activeSort = sortState.find((s) => s.sortDir !== null);
    if (!activeSort) return data;

    const column = this.config().columns.find(
      (col) => this.getColumnDef(col) === activeSort.sortBy,
    );
    const dir = activeSort.sortDir === 'asc' ? 1 : -1;

    return [...data].sort((a, b) => {
      if (column?.comparator) {
        return column.comparator(a, b) * dir;
      }

      const field = column?.field as string;
      const valA = this.getNestedValue(a, field);
      const valB = this.getNestedValue(b, field);
      return this.compareValues(valA, valB) * dir;
    });
  }

  private compareValues(a: any, b: any): number {
    if (a === null || a === undefined) return b === null || b === undefined ? 0 : -1;
    if (b === null || b === undefined) return 1;

    if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
    if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
    if (typeof a === 'number' && typeof b === 'number') return a - b;

    return String(a).localeCompare(String(b));
  }

  private initializeSortState(): void {
    this.sortState.set(
      this.config()
        .columns.filter((col: TColumnConfig) => col.sortable)
        .map((col: TColumnConfig) => ({
          sortBy: this.getColumnDef(col),
          sortDir: null,
        })),
    );
  }

  private getNestedValue(obj: T, path: string): any {
    if (!path || typeof path !== 'string') {
      return null;
    }
    return path.split('.').reduce((value: any, key) => value?.[key] ?? null, obj);
  }
}
