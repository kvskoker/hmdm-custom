import { Component, inject, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  BaseComponent,
  LoaderDirective,
  MatButtonModule,
  MatCardModule,
  MatDivider,
  MatIconModule,
  MatTabsModule,
  SearchContainer,
  TranslatePipe,
} from 'hmdm-ui-kit';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs';
import { SearchMessagesFormConfig } from '../../config/search-messages-form.config';
import { PushDialogService } from '../../services/push-dialog.service';
import { PushFacadeService } from '../../services/push-facade.service';
import { MessagesTable } from '../messages-table/messages-table';
import { SearchForm } from '../search-form/search-form';

@Component({
  selector: 'push-messages',
  templateUrl: './messages.html',
  styleUrl: './messages.scss',
  imports: [
    MatTabsModule,
    TranslatePipe,
    MatCardModule,
    LoaderDirective,
    SearchContainer,
    MatDivider,
    MatIconModule,
    MessagesTable,
    SearchForm,
    MatButtonModule,
  ],
})
export class Messages extends BaseComponent implements OnInit {
  @ViewChild('table') table!: MessagesTable;

  private readonly pushFacadeService = inject(PushFacadeService);
  private readonly pushDialogService = inject(PushDialogService);
  private readonly searchMessagesFormConfig = inject(SearchMessagesFormConfig);
  private readonly activatedRoute = inject(ActivatedRoute);

  tableSearchControl: FormControl<string> = new FormControl('', { nonNullable: true });
  isLoadingMessages = this.pushFacadeService.isLoadingMessages;
  formGroup = this.searchMessagesFormConfig.getFormGroup();
  activeFiltersCount: WritableSignal<number> = signal(0);

  ngOnInit(): void {
    if (this.activatedRoute.snapshot.queryParams['deviceNumber']) {
      const value = this.activatedRoute.snapshot.queryParams['deviceNumber'];

      setTimeout(() => {
        this.formGroup.patchValue({
          deviceFilter: value,
        });
      });
    }

    this.formGroup.valueChanges
      .pipe(
        this.untilDestroyed(),
        tap(() => {
          let cnt = 0;

          if (
            this.formGroup.controls.dateRange.value?.start ||
            this.formGroup.controls.dateRange.value?.end
          ) {
            cnt++;
          }
          if (this.formGroup.controls.deviceFilter.value) {
            cnt++;
          }

          this.activeFiltersCount.set(cnt);
          debounceTime(300);
        }),
      )
      .subscribe(() => {
        this.table?.resetPagination();
        this.pushFacadeService.setFormData(this.formGroup.getRawValue());
      });

    this.tableSearchControl.valueChanges
      .pipe(this.untilDestroyed(), debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.table.resetPagination();
        this.pushFacadeService.setSearchTerm(this.tableSearchControl.value);
      });
  }

  onNewMessageClick(): void {
    this.pushDialogService.openNewMessageDialog();
  }
}
