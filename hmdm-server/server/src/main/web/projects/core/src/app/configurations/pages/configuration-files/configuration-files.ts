import { Component, inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseComponent, SearchContainer } from 'hmdm-ui-kit';
import { ConfigurationFileTable } from '../../components/configuration-file-table/configuration-file-table';
import { ConfigurationFileDialogService } from '../../services/configuration-files-dialog.service';

@Component({
  selector: 'core-configuration-files',
  templateUrl: './configuration-files.html',
  styleUrl: './configuration-files.scss',
  imports: [
    MatCardModule,
    MatDividerModule,
    TranslatePipe,
    MatButtonModule,
    MatIconModule,
    SearchContainer,
    ConfigurationFileTable,
  ],
})
export class ConfigurationFiles extends BaseComponent implements OnInit {
  private readonly dialogService = inject(ConfigurationFileDialogService);

  tableSearchControl: FormControl<string> = new FormControl('', { nonNullable: true });

  ngOnInit(): void {}

  onAddFileClick(): void {
    this.dialogService.openAddDialog();
  }
}
