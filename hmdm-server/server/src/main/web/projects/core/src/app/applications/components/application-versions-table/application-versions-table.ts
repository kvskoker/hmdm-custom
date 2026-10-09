import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MatButtonModule, MatIconModule, Table } from 'hmdm-ui-kit';
import { map, switchMap, take, tap } from 'rxjs';
import { TApplicationDTO } from '../../../entity/application/types/application-dto.type';
import { ApplicationVersionsTableConfig } from '../../configuration/application-versions-table.config';
import { ApplicationFacadeService } from '../../services/application-facade.service';
import { VersionDialogService } from '../../services/version-dialog.service';
import { VersionFacadeService } from '../../services/version-facade.service';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';

@Component({
  selector: 'core-application-versions-table',
  templateUrl: './application-versions-table.html',
  styleUrl: './application-versions-table.scss',
  imports: [
    MatCardModule,
    TranslatePipe,
    MatDividerModule,
    Table,
    MatButtonModule,
    MatIconModule,
    HasPermissionDirective,
    RouterLink,
  ],
})
export class ApplicationVersionsTable implements OnInit {
  private readonly applicationsVersionsTableConfig = inject(ApplicationVersionsTableConfig);
  private readonly applicationFacadeService = inject(ApplicationFacadeService);
  private readonly versionFacadeService = inject(VersionFacadeService);
  private readonly versionDialogService = inject(VersionDialogService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  tableConfig = this.applicationsVersionsTableConfig.getConfig();
  tableData = this.versionFacadeService.versions;
  application = signal<TApplicationDTO | null>(null);

  ngOnInit(): void {
    this.route.params
      .pipe(
        take(1),
        map((params) => +params['applicationId']),
        tap((applicationId) => {
          this.versionFacadeService.initApplicationId(applicationId);
        }),
        switchMap((applicationId) => {
          return this.applicationFacadeService.getApplication(applicationId);
        }),
        take(1),
      )
      .subscribe((app) => {
        this.application.set(app);
      });
  }

  onAddVersionClick(): void {
    const id = this.application()?.id;

    if (!id) {
      return;
    }

    this.versionDialogService.openAddVersionDialog(id);
  }
}
