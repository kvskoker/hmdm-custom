import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { finalize, take } from 'rxjs';
import { TOption } from 'hmdm-ui-kit';
import { FileService } from '../../entity/file/services/file.service';
import { TFileDTO } from '../../entity/file/types/file-dto.type';

@Injectable({
  providedIn: 'root',
})
export class FilesFacadeService {
  private readonly fileService: FileService = inject(FileService);
  private _files: WritableSignal<TFileDTO[]> = signal<TFileDTO[]>([]);
  private _allFiles: WritableSignal<TFileDTO[]> = signal<TFileDTO[]>([]);
  private searchTerm: WritableSignal<string> = signal('');

  isLoadingFiles: WritableSignal<boolean> = signal(false);
  files: Signal<TFileDTO[]> = this._files.asReadonly();
  allFiles: Signal<TFileDTO[]> = this._allFiles.asReadonly();
  filesOptions: Signal<TOption<number>[]> = computed(() =>
    this._files()?.map((file: TFileDTO) => ({
      viewValue: file.url?.split('/').pop() || file.description,
      value: file.id!,
    })),
  );

  constructor() {
    this.searchFiles(true);
  }

  changeTerm(term: string): void {
    this.searchTerm.set(term);
  }

  searchFiles(isInitAll: boolean = false): void {
    this.isLoadingFiles.set(true);

    this.fileService
      .searchFiles(this.searchTerm())
      .pipe(
        take(1),
        finalize(() => this.isLoadingFiles.set(false)),
      )
      .subscribe({
        next: (files: TFileDTO[]) => {
          this._files.set(files);

          if (isInitAll) {
            this._allFiles.set(files);
          }
        },
      });
  }

  clearState(): void {
    this._files.set([]);
    this.searchTerm.set('');
  }

  initAllFiles(): void {
    this.fileService
      .searchFiles('')
      .pipe(take(1))
      .subscribe({
        next: (files: TFileDTO[]) => {
          this._allFiles.set(files);
        },
      });
  }
}
