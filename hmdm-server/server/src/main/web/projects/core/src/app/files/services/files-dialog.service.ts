import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { filter, switchMap, take } from 'rxjs';
import { ConfirmDialog } from 'hmdm-ui-kit';
import { TFileDTO } from '../../entity/file/types/file-dto.type';
import { FilesFacadeService } from './files-facade.service';
import { FilesConfigDialog } from '../components/files-config-dialog/files-config-dialog';
import { FilesDialog } from '../components/files-dialog/files-dialog';
import { FileService } from '../../entity/file/services/file.service';

@Injectable({
  providedIn: 'root',
})
export class FilesDialogService {
  private dialog: MatDialog = inject(MatDialog);
  private fileService = inject(FileService);
  private filesFacadeService = inject(FilesFacadeService);

  openAddFileDialog(): void {
    this.dialog
      .open(FilesDialog)
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe(() => {
        this.filesFacadeService.searchFiles();
      });
  }

  openConfigFileDialog(file: TFileDTO): void {
    this.dialog
      .open(FilesConfigDialog, { data: { fileId: file.id, fileName: file.filePath } })
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        switchMap((data) => {
          return this.fileService.updateFileConfigurations(file.id, data);
        }),
      )
      .subscribe(() => {
        this.filesFacadeService.searchFiles();
      });
  }

  openEditFileDialog(file: TFileDTO): void {
    this.dialog
      .open(FilesDialog, { data: { file } })
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe(() => {
        this.filesFacadeService.searchFiles();
      });
  }

  openDeleteFileDialog(file: TFileDTO): void {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          title: '',
          message: 'question.delete.file',
          confirmButtonText: 'button.delete',
          cancelButtonText: 'button.cancel',
          params: {
            fileName: file.filePath,
          },
        },
      })
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        switchMap(() => {
          return this.fileService.deleteFile(file);
        }),
      )
      .subscribe(() => {
        this.filesFacadeService.searchFiles();
      });
  }
}
