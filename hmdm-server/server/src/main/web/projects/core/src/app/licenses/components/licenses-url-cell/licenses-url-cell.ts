import { Component } from '@angular/core';
import {BaseCellRenderer} from 'hmdm-ui-kit';
import {TLicensesRestDTO} from '../../types/licenses-rest-dto.type';
import {TranslatePipe} from '@ngx-translate/core';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'core-licenses-url-cell',
  imports: [
    TranslatePipe,
    MatButton
  ],
  templateUrl: './licenses-url-cell.html',
  styleUrl: './licenses-url-cell.scss',
})
export class LicensesUrlCell extends BaseCellRenderer<TLicensesRestDTO> {}
