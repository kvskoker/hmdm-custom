import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { Observable, take } from 'rxjs';
import { ApplicationService } from '../../entity/application/services/application.service';
import { TApplicationDTO } from '../../entity/application/types/application-dto.type';
import { TVersionDTO } from '../../entity/application/types/version-dto.type';

@Injectable({ providedIn: 'root' })
export class VersionFacadeService {
  private readonly applicationService: ApplicationService = inject(ApplicationService);

  private _versions: WritableSignal<TVersionDTO[]> = signal([]);
  private lastId: number = -1;

  versions: Signal<TVersionDTO[]> = this._versions.asReadonly();

  getApplication(id: number): Observable<TApplicationDTO | null> {
    return this.applicationService.getApplication(id);
  }

  initApplicationId(applicationId: number): void {
    this.lastId = applicationId;

    this.applicationService
      .getVersionsByApplicationId(applicationId)
      .pipe(take(1))
      .subscribe({
        next: (versions) => {
          this._versions.set(versions);
        },
      });
  }

  initLast(): void {
    this.initApplicationId(this.lastId);
  }
}
