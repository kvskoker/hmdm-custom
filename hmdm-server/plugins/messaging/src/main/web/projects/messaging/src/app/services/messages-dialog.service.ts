import { inject, Injectable } from '@angular/core';
import { MatDialog } from 'hmdm-ui-kit';
import { MessagesFacadeService } from './messages-facade.service';
import { MessageDialog } from '../components/message-dialog/message-dialog';
import { filter, switchMap, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MessagesDialogService {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly messagesFacadeService = inject(MessagesFacadeService);

  openNewMessageDialog(): void {
    this.dialog
      .open(MessageDialog)
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        switchMap((data) => this.messagesFacadeService.sendMessage(data)),
      )
      .subscribe(() => {
        this.messagesFacadeService.searchMessages();
      });
  }
}
