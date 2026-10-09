import {Component, effect, inject, OnInit, signal, WritableSignal} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { RebrandingService } from 'hmdm-ui-kit';
import { SIDE_MENU_TREE } from '../../const/side-menu-tree.const';
import { AuthService } from '../../services/auth.service';
import { TSideMenuNode } from '../../types/side-menu-node.type';
import { environment } from '../../../../environments/environment';
import {LicenseService} from '../../../auth/services/license.service';

type TSideMenuNodeExtended = TSideMenuNode & {
  isLocked?: boolean;
  pluginName?: string;
};

@Component({
  selector: 'core-side-menu',
  imports: [
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    RouterLinkActive,
    RouterLink,
    MatDividerModule,
    TranslatePipe,
    RouterLink,
  ],
  templateUrl: './side-menu.html',
  styleUrl: './side-menu.scss',
})
export class SideMenu implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly rebrandingService = inject(RebrandingService);
  private readonly licenseService = inject(LicenseService);
  private readonly router = inject(Router);

  private hasLicensePermission: boolean | undefined = false;

  readonly rebranding = this.rebrandingService.rebranding;
  readonly logoUrl = `${environment.baseApiUrl}rest/public/brand/logo`;
  private pluginLicenses = this.licenseService.pluginLicenses;

  dataSource: WritableSignal<TSideMenuNode[]> = signal([]);

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      this.hasLicensePermission =
        user?.superAdmin ||
        (
          user?.singleCustomer &&
          this.authService.hasPermission('settings')
        )

      if (!user) {
        this.dataSource.set([]);
        return;
      }

      this.dataSource.set(this.filterMenuTree(SIDE_MENU_TREE));
    });
  }

  ngOnInit() {
    this.licenseService.getValidPluginLicenses().subscribe(res => {
      this.pluginLicenses.set(res);
      this.dataSource.set(this.filterMenuTree(SIDE_MENU_TREE));
    });
  }

  childrenAccessor = (node: TSideMenuNode) => node.children ?? [];

  hasChild = (_: number, node: TSideMenuNode) => !!node.children && node.children.length > 0;

  private filterMenuTree(nodes: TSideMenuNodeExtended[]): TSideMenuNodeExtended[] {
    const licenses = this.pluginLicenses();

    return nodes
      .filter((node) => {
        if (node.permission) {
          return this.authService.hasPermission(node.permission);
        }
        return true;
      })
      .map((node) => {
        let isLocked = false;
        if (node.pluginName) {
          isLocked = licenses[node.pluginName] === false;
        }

        if (node.children) {
          return {
            ...node,
            isLocked,
            children: this.filterMenuTree(node.children),
          };
        }
        return { ...node, isLocked };
      })
      .filter((node) => !node.children || node.children.length > 0);
  }

  onPluginClick(event: MouseEvent, node: TSideMenuNodeExtended) {
    if (node.isLocked) {
      event.preventDefault();
      event.stopPropagation();

      if (this.hasLicensePermission) {
        this.router.navigate(['/home/licenses']);
      }
    }
  }
}
