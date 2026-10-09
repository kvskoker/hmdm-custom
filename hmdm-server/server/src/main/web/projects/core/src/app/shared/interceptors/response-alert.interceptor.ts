import { HttpErrorResponse, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ALERT_STATUS_MESSAGE_MAPPER } from '../const/alert-status-mapper.const';
import { SnackBarService } from '../services/snack-bar.service';
import { SKIP_ALERT } from 'hmdm-ui-kit';

const UNKNOWN_ERROR_MESSAGE = 'alerts.unknown.error';

export const responseAlertInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBarService = inject(SnackBarService);
  const skipAlert = req.context.get(SKIP_ALERT);

  return next(req).pipe(
    tap((event: HttpEvent<any>) => {
      if (skipAlert) return;

      if (
        (event.type === 4 && event.statusText !== 'OK') ||
        (event.type === 4 && event.body?.status === 'ERROR')
      ) {
        console.log('Error intercepted:');
        console.log(event);
        const message = event.body['message'] || UNKNOWN_ERROR_MESSAGE;
        snackBarService.error(message);
      }
    }),

    catchError((error: HttpErrorResponse) => {
      if (!skipAlert && error.status !== 403) {
        snackBarService.error(getMessage(error));
      }
      return throwError(() => error);
    }),
  );
};

const getMessage = (request: HttpErrorResponse): string =>
  ALERT_STATUS_MESSAGE_MAPPER[request.status] || UNKNOWN_ERROR_MESSAGE;
