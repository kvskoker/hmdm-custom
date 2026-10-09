import { inject, Injectable } from '@angular/core';
import { FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { TConfigurationDesignForm } from '../types/configuration-design-form.type';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationDesignFormConfig {
  private readonly fb = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TConfigurationDesignForm> {
    return this.fb.group<TConfigurationDesignForm>({
      useDefaultDesignSettings: this.fb.control(false),
      backgroundColor: this.fb.control(null),
      textColor: this.fb.control(null),
      backgroundImageUrl: this.fb.control(null),
      iconSize: this.fb.control(null),
      desktopHeader: this.fb.control(null),
      desktopHeaderTemplate: this.fb.control(null),
      orientation: this.fb.control(null),
      displayStatus: this.fb.control(false),
    });
  }
}
