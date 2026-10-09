import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from 'hmdm-ui-kit';
import { filter, take } from 'rxjs';
import { TIconDto } from '../../entity/icon/types/icon-dto.type';
import { IconDialog } from '../components/icon-dialog/icon-dialog';
import { IconFacadeService } from './icon-facade.service';

@Injectable({ providedIn: 'root' })
export class IconDialogService {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly iconFacadeService = inject(IconFacadeService);

  openIconDialog(): void {
    this.dialog
      .open(IconDialog, { width: '400px' })
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe({
        next: (result) => {
          this.iconFacadeService.createIcon(result);
        },
      });
  }

  openIconEditDialog(icon: TIconDto): void {
    this.dialog
      .open(IconDialog, {
        width: '400px',
        data: icon,
      })
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe({
        next: (result) => {
          this.iconFacadeService.updateIcon({ ...icon, ...result });
        },
      });
  }

  openDeleteIconDialog(icon: TIconDto): void {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          message: 'question.delete.icon',
          params: { iconName: icon.name },
        },
        width: '400px',
      })
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe(() => {
        this.iconFacadeService.deleteIcon(icon.id);
      });
  }
}
