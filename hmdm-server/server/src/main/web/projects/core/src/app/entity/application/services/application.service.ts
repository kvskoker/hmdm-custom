import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { THttpResponse } from 'hmdm-ui-kit';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TApplicationDTO } from '../types/application-dto.type';
import { TCreateApplicationRequest } from '../types/create-application-request.type';
import { TVersionDTO } from '../types/version-dto.type';
import { TCreateVersionRequest } from '../types/create-version-request.type';
import { EApplicationType } from '../enum/application-type.enum';
import { TFileUploadResult } from '../types/file-upload-result.type';
import { TUpdateVersionRequest } from '../types/update-version-request.type';
import { TValidatePkgRequest } from '../types/validate-pkg-request.type';
import { EApplicationArchitecture } from '../enum/application-architecture.enum';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private http: HttpClient = inject(HttpClient);

  private readonly APPLICATION_TYPE_URL_MAP: Record<EApplicationType, string> = {
    [EApplicationType.APP]: 'android',
    [EApplicationType.WEB]: 'web',
    [EApplicationType.INTENT]: 'web',
  };

  search(name: string | null): Observable<TApplicationDTO[]> {
    const url = name
      ? `rest/private/applications/search/${name}`
      : `rest/private/applications/search`;
    return this.http.get<THttpResponse<TApplicationDTO[]>>(url).pipe(
      map((response) => {
        return response.data;
      }),
    );
  }

  getApplication(id: number): Observable<TApplicationDTO | null> {
    return this.http.get<THttpResponse<TApplicationDTO>>(`rest/private/applications/${id}`).pipe(
      map((response) => {
        return response.data;
      }),
    );
  }

  getVersionsByApplicationId(applicationId: number): Observable<TVersionDTO[]> {
    return this.http
      .get<THttpResponse<TVersionDTO[]>>(`rest/private/applications/${applicationId}/versions`)
      .pipe(
        map((response) => {
          return response.data;
        }),
      );
  }

  createApplication(body: TCreateApplicationRequest): Observable<TApplicationDTO> {
    const typeUrl = this.APPLICATION_TYPE_URL_MAP[body.type];

    let requestBody = { ...body };
    if (requestBody.type === EApplicationType.APP) {
      requestBody = {
        ...requestBody,
        arch: requestBody.arch === EApplicationArchitecture.NONE ? null : requestBody.arch,
      };
    }

    return this.http
      .put<THttpResponse<TApplicationDTO>>(`rest/private/applications/${typeUrl}`, requestBody)
      .pipe(
        map((response) => {
          return response.data;
        }),
      );
  }

  createApplicationVersion(body: TCreateVersionRequest): Observable<TVersionDTO> {
    let requestBody = { ...body };
    if (requestBody.type === EApplicationType.APP) {
      requestBody = {
        ...requestBody,
        arch: requestBody.arch === EApplicationArchitecture.NONE ? null : requestBody.arch,
      };
    }

    return this.http
      .put<THttpResponse<TVersionDTO>>('rest/private/applications/versions', requestBody)
      .pipe(
        map((response) => {
          return response.data;
        }),
      );
  }

  updateApplicationVersion(body: TUpdateVersionRequest): Observable<TVersionDTO> {
    return this.http
      .put<THttpResponse<TVersionDTO>>('rest/private/applications/versions', body)
      .pipe(
        map((response) => {
          return response.data;
        }),
      );
  }

  deleteApplicationVersion(versionId: number): Observable<void> {
    return this.http
      .delete<THttpResponse<void>>(`rest/private/applications/versions/${versionId}`)
      .pipe(map(() => void 0));
  }

  deleteApplication(applicationId: number): Observable<null> {
    return this.http
      .delete<THttpResponse<void>>(`rest/private/applications/${applicationId}`)
      .pipe(map(() => null));
  }

  validatePkg(body: TValidatePkgRequest): Observable<TApplicationDTO[]> {
    return this.http
      .put<THttpResponse<TApplicationDTO[]>>('rest/private/applications/validatePkg', body)
      .pipe(map((response) => response.data));
  }

  checkNameExists(name: string): Observable<boolean> {
    return this.search(name).pipe(
      map((apps) => apps.some((app) => app.name.toLowerCase() === name.toLowerCase())),
    );
  }

  uploadFile(file: File): Observable<TFileUploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post<THttpResponse<TFileUploadResult>>('rest/private/web-ui-files', formData)
      .pipe(
        map((response) => {
          return response.data;
        }),
      );
  }

  uploadFileWithProgress(file: File): Observable<number | TFileUploadResult> {
    return new Observable<number | TFileUploadResult>((observer) => {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          observer.next(Math.round((event.loaded / event.total) * 100));
        }
      });

      xhr.upload.addEventListener('load', () => observer.next(100));

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response: THttpResponse<TFileUploadResult> = JSON.parse(xhr.responseText);
          if (response.status === 'ERROR') {
            observer.error(new Error(response.message ?? undefined));
          } else {
            observer.next(response.data);
            observer.complete();
          }
        } else {
          observer.error(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => observer.error(new Error('Upload failed')));
      xhr.addEventListener('abort', () => observer.complete());

      xhr.open('POST', `${environment.baseApiUrl}rest/private/web-ui-files`);
      xhr.withCredentials = true;
      xhr.send(formData);

      return () => xhr.abort();
    });
  }

  getAdminApplications(value?: string): Observable<TApplicationDTO[]> {
    const url = value
      ? `rest/private/applications/admin/search/${encodeURIComponent(value)}`
      : 'rest/private/applications/admin/search';
    return this.http
      .get<THttpResponse<TApplicationDTO[]>>(url)
      .pipe(map((response) => response.data));
  }

  turnIntoCommonApplication(id: number): Observable<void> {
    return this.http
      .get<THttpResponse<void>>(`rest/private/applications/admin/common/${id}`)
      .pipe(map(() => void 0));
  }
}
