import { Component, inject, OnInit } from '@angular/core';
import {
  DialogBase,
  DialogCommonButtons,
  DialogTemplate,
  MAT_DIALOG_DATA,
  TranslatePipe,
} from 'hmdm-ui-kit';
import { TFileConfigDTO } from '../../../entity/file/types/file-config-dto.type';
import { FilesConfigFacadeService } from '../../services/files-config-facade.service';
import { FilesConfigForm } from '../files-config-form/files-config-form';

@Component({
  selector: 'core-files-config-dialog',
  templateUrl: './files-config-dialog.html',
  styleUrl: './files-config-dialog.scss',
  imports: [DialogTemplate, DialogCommonButtons, FilesConfigForm, TranslatePipe],
})
export class FilesConfigDialog extends DialogBase implements OnInit {
  private data = inject(MAT_DIALOG_DATA);
  private fileFacadeService = inject(FilesConfigFacadeService);
  private configData: TFileConfigDTO[] = [];

  configurations = this.fileFacadeService.configurations;
  fileDisplayName = this.data.fileName;

  ngOnInit(): void {
    this.fileFacadeService.initFileId(this.data.fileId);
  }

  onFormChange($event: TFileConfigDTO[]): void {
    console.log('Config form change:', $event);

    this.configData = $event;
  }

  override onSave(): void {
    this.dialogRef.close(this.configData);
  }
}
