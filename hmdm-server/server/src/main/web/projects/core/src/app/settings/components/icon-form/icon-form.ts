import { Component, inject, input, InputSignal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Selector, TextInputComponent, TranslatePipe } from 'hmdm-ui-kit';
import { TIconForm } from '../../types/icon-form.type';
import { FilesFacadeService } from '../../../files/services/files-facade.service';

@Component({
  selector: 'core-icon-form',
  templateUrl: './icon-form.html',
  styleUrl: './icon-form.scss',
  imports: [ReactiveFormsModule, TextInputComponent, Selector, TranslatePipe],
})
export class IconForm {
  formGroup: InputSignal<FormGroup<TIconForm>> = input.required();

  private readonly filesFacadeService = inject(FilesFacadeService);

  filesOptions = this.filesFacadeService.filesOptions;
}
