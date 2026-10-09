import { Injectable, signal } from '@angular/core';
import {
  DEVICE_PARAMS,
  WIFI_PARAMS,
  GPS_PARAMS,
  MOBILE1_PARAMS,
  MOBILE2_PARAMS,
} from './dynamic-data-parser.service';

export type FieldGroup = 'device' | 'wifi' | 'gps' | 'mobile1' | 'mobile2';

export type FieldMetadata = {
  name: string;
  group: FieldGroup;
  selected: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class FieldsSelectionService {
  private readonly STORAGE_KEY = 'deviceinfo.fields.selection';

  private readonly allFieldsList = [
    ...DEVICE_PARAMS.map((name) => ({ name, group: 'device' as FieldGroup })),
    ...WIFI_PARAMS.map((name) => ({ name, group: 'wifi' as FieldGroup })),
    ...GPS_PARAMS.map((name) => ({ name, group: 'gps' as FieldGroup })),
    ...MOBILE1_PARAMS.map((name) => ({ name, group: 'mobile1' as FieldGroup })),
    ...MOBILE2_PARAMS.map((name) => ({ name, group: 'mobile2' as FieldGroup })),
  ];

  private readonly _fieldsSelection = signal<Record<string, boolean>>(this.initializeSelection());

  readonly fieldsSelection = this._fieldsSelection.asReadonly();

  readonly deviceFields = signal<FieldMetadata[]>(this.getFieldsByGroup('device'));
  readonly wifiFields = signal<FieldMetadata[]>(this.getFieldsByGroup('wifi'));
  readonly gpsFields = signal<FieldMetadata[]>(this.getFieldsByGroup('gps'));
  readonly mobile1Fields = signal<FieldMetadata[]>(this.getFieldsByGroup('mobile1'));
  readonly mobile2Fields = signal<FieldMetadata[]>(this.getFieldsByGroup('mobile2'));

  toggleField(fieldName: string): void {
    const current = this._fieldsSelection();
    const updated = {
      ...current,
      [fieldName]: !current[fieldName],
    };
    this._fieldsSelection.set(updated);
    this.saveToLocalStorage(updated);
    this.updateFieldMetadata();
  }

  toggleGroup(group: FieldGroup, selected: boolean): void {
    const current = this._fieldsSelection();
    const updated = { ...current };

    this.allFieldsList
      .filter((f) => f.group === group)
      .forEach((f) => {
        updated[f.name] = selected;
      });

    this._fieldsSelection.set(updated);
    this.saveToLocalStorage(updated);
    this.updateFieldMetadata();
  }

  selectAll(): void {
    const selection: Record<string, boolean> = {};
    this.allFieldsList.forEach((field) => {
      selection[field.name] = true;
    });
    this._fieldsSelection.set(selection);
    this.saveToLocalStorage(selection);
    this.updateFieldMetadata();
  }

  deselectAll(): void {
    const selection: Record<string, boolean> = {};
    this.allFieldsList.forEach((field) => {
      selection[field.name] = false;
    });
    this._fieldsSelection.set(selection);
    this.saveToLocalStorage(selection);
    this.updateFieldMetadata();
  }

  resetToDefaults(): void {
    const selection: Record<string, boolean> = {};
    this.allFieldsList.forEach((field) => {
      selection[field.name] = true;
    });
    this._fieldsSelection.set(selection);
    this.saveToLocalStorage(selection);
    this.updateFieldMetadata();
  }

  clearLocalStorage(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear fields selection from localStorage:', error);
    }
  }

  getSelectedFields(): string[] {
    const selection = this._fieldsSelection();
    return this.allFieldsList.filter((f) => selection[f.name]).map((f) => f.name);
  }

  getAllFields(): string[] {
    return this.allFieldsList.map((f) => f.name);
  }

  isGroupFullySelected(group: FieldGroup): boolean {
    const selection = this._fieldsSelection();
    return this.allFieldsList.filter((f) => f.group === group).every((f) => selection[f.name]);
  }

  isGroupPartiallySelected(group: FieldGroup): boolean {
    const selection = this._fieldsSelection();
    const groupFields = this.allFieldsList.filter((f) => f.group === group);
    const selectedCount = groupFields.filter((f) => selection[f.name]).length;
    return selectedCount > 0 && selectedCount < groupFields.length;
  }

  private initializeSelection(): Record<string, boolean> {
    const savedSelection = this.loadFromLocalStorage();
    if (savedSelection) {
      const isValid = this.allFieldsList.every((field) => field.name in savedSelection);
      if (isValid) {
        return savedSelection;
      }
    }

    // Default: all fields selected
    const selection: Record<string, boolean> = {};
    this.allFieldsList.forEach((field) => {
      selection[field.name] = true;
    });
    return selection;
  }

  private loadFromLocalStorage(): Record<string, boolean> | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load fields selection from localStorage:', error);
    }
    return null;
  }

  private saveToLocalStorage(selection: Record<string, boolean>): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(selection));
    } catch (error) {
      console.warn('Failed to save fields selection to localStorage:', error);
    }
  }

  private getFieldsByGroup(group: FieldGroup): FieldMetadata[] {
    return this.allFieldsList
      .filter((f) => f.group === group)
      .map((f) => ({
        name: f.name,
        group: f.group,
        selected: this._fieldsSelection()[f.name],
      }));
  }

  private updateFieldMetadata(): void {
    this.deviceFields.set(this.getFieldsByGroup('device'));
    this.wifiFields.set(this.getFieldsByGroup('wifi'));
    this.gpsFields.set(this.getFieldsByGroup('gps'));
    this.mobile1Fields.set(this.getFieldsByGroup('mobile1'));
    this.mobile2Fields.set(this.getFieldsByGroup('mobile2'));
  }
}
