export class FileDownloadService {
  downloadTextFile(filename: string, content: string): void {
    this.downloadFile(filename, content, 'text/plain');
  }

  downloadArrayBuffer(
    filename: string,
    content: ArrayBuffer,
    contentType: string = 'application/octet-stream',
  ): void {
    const blob = new Blob([content], { type: contentType });
    this.downloadBlob(filename, blob);
  }

  downloadFile(filename: string, content: string, contentType: string = 'text/plain'): void {
    const blob = new Blob([content], { type: contentType });
    this.downloadBlob(filename, blob);
  }

  downloadBlob(filename: string, blob: Blob): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
