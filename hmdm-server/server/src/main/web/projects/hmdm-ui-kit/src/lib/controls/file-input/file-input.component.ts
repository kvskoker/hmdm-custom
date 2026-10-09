import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseControlValueAccessor } from '../../shared/base/control-value-accessor';
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HelpTooltip } from '../help-tooltip/help-tooltip.component';

@Component({
  selector: 'hmdm-file-input',
  templateUrl: './file-input.component.html',
  styleUrls: ['../controls-style.scss', './file-input.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSuffix,
    HelpTooltip,
  ],
})
export class FileInputComponent extends BaseControlValueAccessor<File | FileList | null> {
  @ViewChild('fileInput', { static: true }) fileInput!: ElementRef<HTMLInputElement>;

  placeholder: InputSignal<string> = input<string>('Choose file...');
  acceptTypes: InputSignal<string> = input<string>('*/*');
  multiple: InputSignal<boolean> = input<boolean>(false);
  maxSize: InputSignal<number | null> = input<number | null>(null); // in bytes
  allowedExtensions: InputSignal<string[]> = input<string[]>([]);

  fileCleared: OutputEmitterRef<void> = output<void>();

  selectedFiles: File[] = [];
  errorMessage = '';

  override writeValue(value: File | FileList | null): void {
    super.writeValue(value);

    if (value === null) {
      this.selectedFiles = [];
      this.fileInput.nativeElement.value = '';
      this.errorMessage = '';
    } else if (value instanceof File) {
      this.selectedFiles = [value];
    } else if (value instanceof FileList) {
      this.selectedFiles = Array.from(value);
    } else if (Array.isArray(value)) {
      this.selectedFiles = value;
    }
  }

  get displayValue(): string {
    if (this.selectedFiles.length === 0) {
      return this.placeholder();
    }

    if (this.multiple()) {
      return this.selectedFiles.length === 1
        ? this.selectedFiles[0].name
        : `${this.selectedFiles.length} files selected`;
    }

    return this.selectedFiles[0]?.name || '';
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) {
      this.clearFiles();
      return;
    }

    this.errorMessage = '';
    const fileArray = Array.from(files);

    // Validate files
    const validFiles = this.validateFiles(fileArray);

    if (validFiles.length === 0) {
      this.clearFiles();
      return;
    }

    this.selectedFiles = validFiles;

    // Emit the value based on multiple flag
    const value = this.multiple() ? validFiles : validFiles[0];
    this.formControl.setValue(value as any);
    this.onTouched();
  }

  openFileDialog(): void {
    this.fileInput.nativeElement.click();
  }

  clearFiles(): void {
    this.selectedFiles = [];
    this.fileInput.nativeElement.value = '';
    this.errorMessage = '';
    this.formControl.setValue(null);
    this.fileCleared.emit();
  }

  private validateFiles(files: File[]): File[] {
    const validFiles: File[] = [];

    for (const file of files) {
      if (!this.isValidFile(file)) {
        continue;
      }
      validFiles.push(file);
    }

    return validFiles;
  }

  private isValidFile(file: File): boolean {
    // Check file size
    if (this.maxSize() && file.size > this.maxSize()!) {
      this.errorMessage = `File size exceeds ${this.formatFileSize(this.maxSize()!)}`;
      return false;
    }

    // Check file extension
    const allowedExts = this.allowedExtensions();
    if (allowedExts.length > 0) {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (!fileExt || !allowedExts.map((ext) => ext.toLowerCase()).includes(fileExt)) {
        this.errorMessage = `File type not allowed. Allowed types: ${allowedExts.join(', ')}`;
        return false;
      }
    }

    return true;
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
