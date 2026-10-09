import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { THttpResponse } from 'hmdm-ui-kit';
import { map, Observable, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TFilesFormValue } from '../../../files/types/files-form.type';
import { TFileUploadResult } from '../../application/types/file-upload-result.type';
import { TCreateFileRequest } from '../types/create-file.request.type';
import { TFileConfigDTO } from '../types/file-config-dto.type';
import { TFileDTO } from '../types/file-dto.type';
import { TLimitResponse } from '../types/limit-response.type';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private http: HttpClient = inject(HttpClient);

  searchFiles(text?: string): Observable<TFileDTO[]> {
    const url = text
      ? `rest/private/web-ui-files/search/${encodeURIComponent(text)}`
      : 'rest/private/web-ui-files/search';

    return this.http.get<THttpResponse<TFileDTO[]>>(url).pipe(map((response) => response.data));
  }

  createFile(value: TFilesFormValue): Observable<TFileDTO> {
    if (value.file) {
      return this.uploadFile(value.file).pipe(
        switchMap((uploadResult: TFileUploadResult) => {
          const request: TCreateFileRequest = {
            description: value.description,
            devicePath: value.devicePath,
            external: value.external,
            replaceVariables: value.replaceVariables,
            filePath: value.filePath,
            tmpPath: uploadResult.serverPath,
          };

          return this.http
            .post<THttpResponse<TFileDTO>>('rest/private/web-ui-files/update', request)
            .pipe(
              map((response) => {
                return response.data;
              }),
            );
        }),
      );
    } else {
      const request: TCreateFileRequest = {
        description: value.description,
        devicePath: value.devicePath,
        external: value.external,
        replaceVariables: value.replaceVariables,
        externalUrl: value.externalUrl,
      };

      return this.http
        .post<THttpResponse<TFileDTO>>('rest/private/web-ui-files/update', request)
        .pipe(
          map((response) => {
            return response.data;
          }),
        );
    }
  }

  updateFile(file: TFileDTO): Observable<TFileDTO> {
    return this.http.post<THttpResponse<TFileDTO>>('rest/private/web-ui-files/update', file).pipe(
      map((response) => {
        return response.data;
      }),
    );
  }

  deleteFile(file: TFileDTO): Observable<void> {
    return this.http.post<THttpResponse<void>>(`rest/private/web-ui-files/remove`, file).pipe(
      map((response) => {
        return response.data;
      }),
    );
  }

  getFileConfigurations(fileId: number): Observable<TFileConfigDTO[]> {
    return this.http
      .get<THttpResponse<TFileConfigDTO[]>>(`rest/private/web-ui-files/configurations/${fileId}`)
      .pipe(map((response) => response.data));
  }

  updateFileConfigurations(fileId: number, configurations: TFileConfigDTO[]): Observable<void> {
    return this.http
      .post<THttpResponse<void>>('rest/private/web-ui-files/configurations', {
        configurations,
        fileId,
      })
      .pipe(map((response) => response.data));
  }

  getStorageLimit(): Observable<TLimitResponse> {
    return this.http
      .get<THttpResponse<TLimitResponse>>('rest/private/web-ui-files/limit')
      .pipe(map((response) => response.data));
  }

  uploadFile(file: File): Observable<TFileUploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post<THttpResponse<TFileUploadResult>>('rest/private/web-ui-files/raw', formData)
      .pipe(map((response) => response.data));
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
      xhr.addEventListener('abort', () => observer.error(new Error('Upload aborted')));

      xhr.open('POST', `${environment.baseApiUrl}rest/private/web-ui-files/raw`);
      xhr.withCredentials = true;
      xhr.send(formData);

      return () => xhr.abort();
    });
  }

  createFileFromUpload(
    value: TFilesFormValue,
    uploadResult: TFileUploadResult,
  ): Observable<TFileDTO> {
    const request: TCreateFileRequest = {
      description: value.description,
      devicePath: value.devicePath,
      external: value.external,
      replaceVariables: value.replaceVariables,
      filePath: value.filePath,
      tmpPath: uploadResult.serverPath,
    };

    return this.http
      .post<THttpResponse<TFileDTO>>('rest/private/web-ui-files/update', request)
      .pipe(map((response) => response.data));
  }
}
