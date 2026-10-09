import {inject, Injectable} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {webSocket} from 'rxjs/webSocket';
import {SnackBarService} from 'hmdm-ui-kit';
import {TAlertDTO} from '../../entity/alert/types/alert-dto.type';
import {environment} from '../../../environments/environment';

@Injectable({providedIn: 'root'})
export class PushMessagesService {
  private readonly snackBar = inject(SnackBarService);

  private getFullWsUrl(path: string): string {
    return `${environment.baseApiUrl}${path}`;
  }

  public listenForPushMessages(path: string): Observable<TAlertDTO> {
    const socket$ = webSocket<TAlertDTO>({ url: this.getFullWsUrl(path) });

    return socket$.asObservable().pipe(
      tap((message: TAlertDTO) => {
        this.triggerSnackbar(message);
      })
    );
  }

  private triggerSnackbar(message: TAlertDTO) {
    const snackbarText = message.message;

    switch (message.level) {
      case 10:
        this.snackBar.success(snackbarText);
        break;
      case 20:
        this.snackBar.warning(snackbarText);
        break;
      case 30:
        this.snackBar.error(snackbarText);
        break;
      default:
        this.snackBar.info(snackbarText);
        break;
    }
  }
}
