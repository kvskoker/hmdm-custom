import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { TFileConfigDTO } from '../../entity/file/types/file-config-dto.type';
import { FileService } from '../../entity/file/services/file.service';
import { take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FilesConfigFacadeService {
  private fileService: FileService = inject(FileService);

  _configurations: WritableSignal<TFileConfigDTO[]> = signal([]);
  configurations = this._configurations.asReadonly();

  initFileId(id: number): void {
    this.fileService
      .getFileConfigurations(id)
      .pipe(take(1))
      .subscribe((configs) => {
        this._configurations.set(configs);
      });
  }
}
