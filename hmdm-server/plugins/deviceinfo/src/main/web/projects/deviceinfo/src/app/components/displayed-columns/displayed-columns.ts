import { Component, inject } from '@angular/core';
import { FieldsSelectionService } from '../../services/fields-selection.service';
import { MatCheckboxModule, MatButtonModule, TranslatePipe } from 'hmdm-ui-kit';

@Component({
  selector: 'di-displayed-columns',
  imports: [TranslatePipe, MatCheckboxModule, MatButtonModule],
  templateUrl: './displayed-columns.html',
  styleUrl: './displayed-columns.scss',
})
export class DisplayedColumns {
  private readonly fieldsSelectionService = inject(FieldsSelectionService);

  fieldsSelection = this.fieldsSelectionService.fieldsSelection;
  deviceFields = this.fieldsSelectionService.deviceFields;
  wifiFields = this.fieldsSelectionService.wifiFields;
  gpsFields = this.fieldsSelectionService.gpsFields;
  mobile1Fields = this.fieldsSelectionService.mobile1Fields;
  mobile2Fields = this.fieldsSelectionService.mobile2Fields;

  toggleField(fieldName: string): void {
    this.fieldsSelectionService.toggleField(fieldName);
  }

  toggleGroup(group: 'device' | 'wifi' | 'gps' | 'mobile1' | 'mobile2'): void {
    const isFullySelected = this.fieldsSelectionService.isGroupFullySelected(group);
    this.fieldsSelectionService.toggleGroup(group, !isFullySelected);
  }

  selectAll(): void {
    this.fieldsSelectionService.selectAll();
  }

  deselectAll(): void {
    this.fieldsSelectionService.deselectAll();
  }

  isGroupFullySelected(group: 'device' | 'wifi' | 'gps' | 'mobile1' | 'mobile2'): boolean {
    return this.fieldsSelectionService.isGroupFullySelected(group);
  }

  isGroupPartiallySelected(group: 'device' | 'wifi' | 'gps' | 'mobile1' | 'mobile2'): boolean {
    return this.fieldsSelectionService.isGroupPartiallySelected(group);
  }
}
