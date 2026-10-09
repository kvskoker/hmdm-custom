import {Component, computed, Signal} from '@angular/core';
import {BaseCellRenderer} from 'hmdm-ui-kit';
import {TLicensesRestDTO} from '../../types/licenses-rest-dto.type';
import {isLicenseValid, LICENSE_STATUS} from '../../const/license-status.const';

@Component({
  selector: 'core-licenses-validity-color-cell',
  imports: [],
  templateUrl: './licenses-validity-color-cell.html',
  styleUrl: './licenses-validity-color-cell.scss',
})
export class LicensesValidityColorCell extends BaseCellRenderer<TLicensesRestDTO> {
  readonly isValid: Signal<boolean> = computed(() => isLicenseValid(this.params().data.status));
  readonly isExpiring: Signal<boolean> = computed(
    () => this.params().data.status === LICENSE_STATUS.EXPIRING,
  );
}
