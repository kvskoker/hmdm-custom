import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { finalize, take } from 'rxjs';
import { TOption } from 'hmdm-ui-kit';
import { IconService } from '../../entity/icon/services/icon.service';
import { TCreateIconRequest } from '../../entity/icon/types/create-icon-request.type';
import { TIconDto } from '../../entity/icon/types/icon-dto.type';

@Injectable({
  providedIn: 'root',
})
export class IconFacadeService {
  private readonly iconService: IconService = inject(IconService);
  private readonly _icons: WritableSignal<TIconDto[]> = signal<TIconDto[]>([]);
  private readonly _allIcons: WritableSignal<TIconDto[]> = signal<TIconDto[]>([]);
  private readonly _isLoading: WritableSignal<boolean> = signal<boolean>(false);
  private searchTerm: WritableSignal<string> = signal('');

  icons: Signal<TIconDto[]> = this._icons.asReadonly();
  iconsOptions: Signal<TOption<number>[]> = computed(() =>
    this._allIcons().map((icon) => ({
      viewValue: icon.name,
      value: icon.id,
    })),
  );
  isLoading: Signal<boolean> = this._isLoading.asReadonly();

  constructor() {
    this.searchIcons(true);
  }

  changeTerm(term: string): void {
    this.searchTerm.set(term);
    this.searchIcons();
  }

  createIcon(data: TCreateIconRequest): void {
    this.iconService
      .createIcon(data)
      .pipe(take(1))
      .subscribe(() => {
        this.searchIcons();
        this.updateAllIcons();
      });
  }

  updateIcon(data: TIconDto): void {
    this.iconService
      .updateIcon(data)
      .pipe(take(1))
      .subscribe(() => {
        this.searchIcons();
        this.updateAllIcons();
      });
  }

  deleteIcon(iconId: number): void {
    this.iconService
      .deleteIcon(iconId)
      .pipe(take(1))
      .subscribe(() => {
        this.searchIcons();
        this.updateAllIcons();
      });
  }

  updateAllIcons(): void {
    this.iconService
      .searchIcons()
      .pipe(take(1))
      .subscribe({
        next: (icons) => {
          this._allIcons.set(icons);
        },
      });
  }

  private searchIcons(initial: boolean = false): void {
    this._isLoading.set(true);

    this.iconService
      .searchIcons(this.searchTerm())
      .pipe(
        take(1),
        finalize(() => this._isLoading.set(false)),
      )
      .subscribe({
        next: (icons) => {
          this._icons.set(icons);

          if (initial) {
            this._allIcons.set(icons);
          }
        },
      });
  }
}
