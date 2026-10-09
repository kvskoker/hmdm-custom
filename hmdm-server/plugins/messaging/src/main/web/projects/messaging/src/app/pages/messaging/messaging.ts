import { Component, inject, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  BaseComponent,
  LoaderDirective,
  MatButtonModule,
  MatCardModule,
  MatDividerModule,
  MatIconModule,
  PersistFormDirective,
  SearchContainer,
  TranslatePipe,
} from 'hmdm-ui-kit';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs';
import { MessagesTable } from '../../components/messages-table/messages-table';
import { SearchForm } from '../../components/search-form/search-form';
import { SearchMessagesFormConfig } from '../../config/search-messages-form.config';
import { MessagesDialogService } from '../../services/messages-dialog.service';
import { MessagesFacadeService } from '../../services/messages-facade.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-messaging',
  templateUrl: './messaging.html',
  styleUrl: './messaging.scss',
  imports: [
    MatCardModule,
    LoaderDirective,
    SearchContainer,
    TranslatePipe,
    MatDividerModule,
    MatIconModule,
    MessagesTable,
    SearchForm,
    MatButtonModule,
    PersistFormDirective,
  ],
})
export class Messaging extends BaseComponent implements OnInit {
  @ViewChild('table') table!: MessagesTable;

  private readonly messagesFacadeService = inject(MessagesFacadeService);
  private readonly messagesDialogService = inject(MessagesDialogService);
  private readonly searchMessagesFormConfig = inject(SearchMessagesFormConfig);
  private readonly activatedRoute = inject(ActivatedRoute);

  tableSearchControl: FormControl<string> = new FormControl('', { nonNullable: true });
  isLoadingMessages = this.messagesFacadeService.isLoadingMessages;
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
          if (this.formGroup.controls.status.value > 0) {
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
        this.messagesFacadeService.setFormData(this.formGroup.getRawValue());
      });

    this.tableSearchControl.valueChanges
      .pipe(this.untilDestroyed(), debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.table.resetPagination();
        this.messagesFacadeService.setSearchTerm(this.tableSearchControl.value);
      });
  }

  onNewMessageClick(): void {
    this.messagesDialogService.openNewMessageDialog();
  }
}
