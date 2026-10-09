import {Component, inject, OnInit} from '@angular/core';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatDivider} from '@angular/material/divider';
import {TranslatePipe} from '@ngx-translate/core';
import {LicensesRestService} from '../../services/licenses-rest.service';
import {LoaderDirective, SnackBarService} from 'hmdm-ui-kit';
import {LicensesTable} from '../../components/licenses-table/licenses-table';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatDialog} from '@angular/material/dialog';
import {AddLicenseDialog} from '../../components/add-license-dialog/add-license-dialog';

@Component({
  selector: 'core-licenses',
  imports: [
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatDivider,
    TranslatePipe,
    LoaderDirective,
    LicensesTable,
    MatButton,
    MatIcon
  ],
  templateUrl: './licenses.html',
  styleUrl: './licenses.scss',
})
export class Licenses implements OnInit {
  private readonly licensesService = inject(LicensesRestService);
  private readonly dialog = inject(MatDialog);

  isLicensesLoading = this.licensesService.licensesLoading;

  ngOnInit() {
    this.licensesService.getLicensesData();
  }

  onAddClick(): void {
    const dialogRef = this.dialog.open(AddLicenseDialog, {
      width: '450px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.licensesService.addLicense(result);
      }
    })
  }
}
