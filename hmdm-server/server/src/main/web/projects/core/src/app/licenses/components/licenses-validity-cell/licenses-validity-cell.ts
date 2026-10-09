import {Component, computed, Signal} from '@angular/core';
import {BaseCellRenderer} from 'hmdm-ui-kit';
import {TLicensesRestDTO} from '../../types/licenses-rest-dto.type';
import {MatIcon} from '@angular/material/icon';
import {isLicenseValid, LICENSE_STATUS} from '../../const/license-status.const';

@Component({
  selector: 'core-licenses-validity-cell',
  imports: [
    MatIcon
  ],
  templateUrl: './licenses-validity-cell.html',
  styleUrl: './licenses-validity-cell.scss',
})
export class LicensesValidityCell extends BaseCellRenderer<TLicensesRestDTO> {
  readonly isValid: Signal<boolean> = computed(() => isLicenseValid(this.params().data.status));
  readonly isExpiring: Signal<boolean> = computed(
    () => this.params().data.status === LICENSE_STATUS.EXPIRING,
  );
}
