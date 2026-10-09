import { HttpInterceptorFn } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('private')) {
    const clonedRequest = req.clone({
      withCredentials: true,
    });
    return next(clonedRequest);
  }

  return next(req);
};
