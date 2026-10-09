import { Component } from '@angular/core';
import { ApplicationVersionsTable } from '../../components/application-versions-table/application-versions-table';
import { ApplicationVersionsTableConfig } from '../../configuration/application-versions-table.config';
import { VersionDialogService } from '../../services/version-dialog.service';

@Component({
  selector: 'core-versions',
  templateUrl: './versions.html',
  styleUrl: './versions.scss',
  imports: [ApplicationVersionsTable],
  providers: [ApplicationVersionsTableConfig, VersionDialogService],
})
export class Versions {}
