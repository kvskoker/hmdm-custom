import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from 'hmdm-ui-kit';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  Subject,
  switchMap,
  take,
} from 'rxjs';
import { ApplicationService } from '../../entity/application/services/application.service';
import { TApplicationDTO } from '../../entity/application/types/application-dto.type';
import { ApplicationDialogService } from '../../applications/services/application-dialog.service';

@Injectable({ providedIn: 'root' })
export class ControlPanelAppsFacadeService {
  private readonly applicationService = inject(ApplicationService);
  private readonly applicationDialogService = inject(ApplicationDialogService);
  private readonly dialog = inject(MatDialog);

  private readonly _data: WritableSignal<TApplicationDTO[]> = signal([]);
  private readonly searchSubject = new Subject<string>();

  data = this._data.asReadonly();
  isLoading: WritableSignal<boolean> = signal(false);

  constructor() {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term) => this.fetchApplications(term));
  }

  searchApplications(value?: string): void {
    this.searchSubject.next(value ?? '');
  }

  openEditDialog(application: TApplicationDTO): void {
    this.applicationDialogService.openEditApplicationDialog(application);
  }

  turnIntoCommonApplication(application: TApplicationDTO): void {
    if (!application.id) return;

    this.dialog
      .open(ConfirmDialog, {
        data: {
          message: 'question.turn2common.application',
          confirmButtonText: 'button.turn.common.app',
          cancelButtonText: 'button.cancel',
          params: { applicationName: application.name },
        },
      })
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        switchMap(() => this.applicationService.turnIntoCommonApplication(application.id)),
        take(1),
      )
      .subscribe(() => this.fetchApplications());
  }

  openDeleteConfirmDialog(application: TApplicationDTO): void {
    if (!application.id) return;

    this.dialog
      .open(ConfirmDialog, {
        data: {
          message: 'question.delete.application',
          confirmButtonText: 'button.delete',
          cancelButtonText: 'button.cancel',
          params: { applicationName: application.name },
        },
      })
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        switchMap(() => this.applicationService.deleteApplication(application.id)),
        take(1),
      )
      .subscribe(() => this.fetchApplications());
  }

  private fetchApplications(value?: string): void {
    this.isLoading.set(true);
    this.applicationService
      .getAdminApplications(value || undefined)
      .pipe(
        take(1),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (apps) => this._data.set(apps || []),
        error: () => this._data.set([]),
      });
  }
}
