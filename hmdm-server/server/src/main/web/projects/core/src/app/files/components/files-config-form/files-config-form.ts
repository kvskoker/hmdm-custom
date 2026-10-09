import {
  Component,
  effect,
  input,
  InputSignal,
  OnInit,
  output,
  OutputEmitterRef,
} from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { TFileConfigDTO } from '../../../entity/file/types/file-config-dto.type';

@Component({
  selector: 'core-files-config-form',
  templateUrl: './files-config-form.html',
  styleUrl: './files-config-form.scss',
  imports: [MatCheckbox],
})
export class FilesConfigForm {
  configurations: InputSignal<TFileConfigDTO[]> = input.required();

  formChange: OutputEmitterRef<TFileConfigDTO[]> = output();

  localConfigurations: TFileConfigDTO[] = [];

  constructor() {
    effect(() => {
      this.localConfigurations = this.configurations().map((config) => ({ ...config }));
    });
  }

  onConfigurationSelectionChange(id: number, selected: boolean) {
    this.localConfigurations = this.localConfigurations.map((config) => {
      if (config.configurationId === id) {
        return { ...config, upload: selected };
      }
      return config;
    });

    this.formChange.emit(this.localConfigurations);
  }
}
