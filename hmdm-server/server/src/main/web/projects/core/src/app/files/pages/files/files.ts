import { Component, inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseComponent, LoaderDirective, MatIconModule, SearchContainer } from 'hmdm-ui-kit';
import { FilesFacadeService } from '../../services/files-facade.service';
import { FilesTable } from '../../components/files-table/files-table';
import { FilesDialogService } from '../../services/files-dialog.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';

@Component({
  selector: 'core-files',
  templateUrl: './files.html',
  styleUrl: './files.scss',
  imports: [
    MatCardModule,
    MatButtonModule,
    TranslatePipe,
    LoaderDirective,
    SearchContainer,
    MatIconModule,
    MatDividerModule,
    FilesTable,
    HasPermissionDirective,
  ],
})
export class Files extends BaseComponent implements OnInit {
  private readonly filesDialogService = inject(FilesDialogService);
  private readonly filesFacadeService = inject(FilesFacadeService);

  filesSearchControl = new FormControl<string>('');
  isLoadingFiles = this.filesFacadeService.isLoadingFiles;

  ngOnInit(): void {
    this.filesFacadeService.clearState();
    this.filesFacadeService.searchFiles();

    this.filesSearchControl.valueChanges
      .pipe(this.untilDestroyed(), debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.filesFacadeService.changeTerm(this.filesSearchControl.value ?? '');
        this.filesFacadeService.searchFiles();
      });
  }

  onAddFileClick(): void {
    this.filesDialogService.openAddFileDialog();
  }
}
