import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { TOption } from 'hmdm-ui-kit';
import { take } from 'rxjs';
import { FileService } from '../../entity/file/services/file.service';
import { TFileDTO } from '../../entity/file/types/file-dto.type';

@Injectable({
  providedIn: 'root',
})
export class FilesOptionsService {
  private readonly fileService: FileService = inject(FileService);
  private _files: WritableSignal<TFileDTO[]> = signal<TFileDTO[]>([]);

  filesOptions: Signal<TOption<number>[]> = computed(() =>
    this._files().map((file: TFileDTO) => ({
      viewValue: file?.url?.split('/').pop() || file.description,
      value: file.id!,
    })),
  );

  constructor() {
    this.searchFiles();
  }

  getFileById(id: number): TFileDTO | undefined {
    return this._files().find((f) => f.id === id);
  }

  searchFiles(): void {
    this.fileService
      .searchFiles()
      .pipe(take(1))
      .subscribe({
        next: (files: TFileDTO[]) => {
          this._files.set(files);
        },
      });
  }
}
