import { Component, inject } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { BaseCellRenderer, MatButtonModule, MatIconModule, TranslatePipe } from 'hmdm-ui-kit';
import { TApplicationDTO } from '../../../entity/application/types/application-dto.type';
import { ApplicationDialogService } from '../../services/application-dialog.service';
import { EApplicationType } from '../../../entity/application/enum/application-type.enum';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'core-application-action-cell',
  templateUrl: './application-action-cell.html',
  styleUrl: './application-action-cell.scss',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltip,
    TranslatePipe,
    HasPermissionDirective,
  ],
})
export class ApplicationActionCell extends BaseCellRenderer<TApplicationDTO, null> {
  private readonly applicationDialogService = inject(ApplicationDialogService);
  private readonly authService = inject(AuthService);
  private readonly router: Router = inject(Router);

  onVersionClick(): void {
    this.router.navigate(['/home/applications', this.params().data.id, 'versions']);
  }

  onConfigClick(): void {
    const id = this.getId();

    if (!id) {
      return;
    }

    this.applicationDialogService.openSelectConfigurationDialog(id);
  }

  onDeleteClick(): void {
    this.applicationDialogService.openDeleteApplicationDialog(this.params().data);
  }

  onEditClick(): void {
    const application = this.params().data;

    this.applicationDialogService.openEditApplicationDialog(application);
  }

  isDeleteDisabled(): boolean {
    const app = this.params().data;
    return app.deletionProhibited;
  }

  isShared(): boolean {
    return this.params().data.common && !this.authService.currentUser()?.superAdmin;
  }

  onSharedClick(): void {
    this.applicationDialogService.openSharedApplicationDialog();
  }

  isShowVersions(): boolean {
    const app = this.params().data;
    return app.type === EApplicationType.APP && !app.system;
  }

  private getId(): number | null {
    return this.params().data.id ?? null;
  }
}
