import { computed, inject, Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { PageEvent } from 'hmdm-ui-kit';
import { finalize, Observable, take } from 'rxjs';
import { ApplicationService } from '../../entity/application/services/application.service';
import { TApplicationDTO } from '../../entity/application/types/application-dto.type';
import { TApplicationsSearchFormValue } from '../types/applications-search-form.type';
import { UserStateService } from '../../shared/services/user-state.service';

@Injectable({ providedIn: 'root' })
export class ApplicationFacadeService {
  private readonly applicationService: ApplicationService = inject(ApplicationService);
  private readonly userStateService = inject(UserStateService);

  private _applications: WritableSignal<TApplicationDTO[]> = signal([]);
  private pageData: PageEvent = { pageIndex: 0, pageSize: 50, length: 0 };
  private searchTerm: string = '';

  formData: TApplicationsSearchFormValue | null = null;
  isLoadingApplications: WritableSignal<boolean> = signal(false);
  applications: Signal<TApplicationDTO[]> = this._applications.asReadonly();
  applicationsTable: Signal<TApplicationDTO[]> = computed(() => {
    const applications = this._applications();

    return applications.filter((app) => {
      const currentUserId = this.userStateService.currentUser()?.id;

      if (!this.formData?.showSystem && app.system) {
        return false;
      }

      if (this.formData?.showMy && app.customerId !== currentUserId) {
        return false;
      }

      return true;
    });
  });

  getApplication(id: number): Observable<TApplicationDTO | null> {
    return this.applicationService.getApplication(id);
  }

  onSearchTermChange(term: string): void {
    if (this.searchTerm === term) {
      return;
    }

    this.searchTerm = term;
    this.pageData.pageIndex = 0;
    this.searchApplications();
  }

  onFormValueChanges(value: TApplicationsSearchFormValue): void {
    this.formData = value;
    this.pageData.pageIndex = 0;
    this.searchApplications();
  }

  updatePage($event: PageEvent): void {
    this.pageData = $event;
    this.searchApplications();
  }

  clearFilters(): void {
    if (this.formData?.showMy === false && this.formData.showSystem === false) {
      return;
    }

    this.formData = {
      showMy: false,
      showSystem: false,
    };
    this.pageData.pageIndex = 0;
    this.searchApplications();
  }

  searchApplications(): void {
    this.isLoadingApplications.set(true);

    this.applicationService
      .search(this.searchTerm)
      .pipe(
        take(1),
        finalize(() => this.isLoadingApplications.set(false)),
      )
      .subscribe({
        next: (applications) => {
          this._applications.set(applications);
        },
      });
  }
}
