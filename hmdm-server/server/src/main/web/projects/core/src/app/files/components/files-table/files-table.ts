import { Component, inject } from '@angular/core';
import { Table } from 'hmdm-ui-kit';
import { FilesFacadeService } from '../../services/files-facade.service';
import { FilesTableConfig } from '../../configuration/files-table.config';

@Component({
  selector: 'core-files-table',
  templateUrl: './files-table.html',
  styleUrl: './files-table.scss',
  imports: [Table],
})
export class FilesTable {
  private filesTableConfig = inject(FilesTableConfig);
  private filesFacadeService = inject(FilesFacadeService);

  tableConfig = this.filesTableConfig.getConfig();
  tableData = this.filesFacadeService.files;
}
