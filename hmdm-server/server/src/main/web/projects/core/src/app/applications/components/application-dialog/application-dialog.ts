import { Component, inject, OnInit, signal, viewChild, WritableSignal } from '@angular/core';
import {
  DialogBase,
  DialogCommonButtons,
  DialogTemplate,
  MAT_DIALOG_DATA,
  MatButtonModule,
  MatIconModule,
} from 'hmdm-ui-kit';
import { TranslatePipe } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { TApplicationDTO } from '../../../entity/application/types/application-dto.type';
import { TApplicationFormEmitValue } from '../../types/application-form.type';
import { ApplicationForm } from '../application-form/application-form';
import { SettingsFacadeService } from '../../../shared/services/settings-facade.service';

@Component({
  selector: 'core-application-dialog',
  templateUrl: './application-dialog.html',
  styleUrl: './application-dialog.scss',
  imports: [
    DialogTemplate,
    ApplicationForm,
    MatButtonModule,
    DialogCommonButtons,
    MatIconModule,
    TranslatePipe,
  ],
})
export class ApplicationDialog extends DialogBase implements OnInit {
  private readonly dialogData = inject(MAT_DIALOG_DATA);
  private readonly applicationForm = viewChild(ApplicationForm);
  private readonly settingsFacadeService = inject(SettingsFacadeService);

  readonly saveTrigger$ = new Subject<TApplicationFormEmitValue>();
  formValue: WritableSignal<TApplicationFormEmitValue | null> = signal(null);
  isSaving: WritableSignal<boolean> = signal(false);
  nameError: WritableSignal<string | null> = signal(null);
  initialValue: TApplicationDTO | null = this.dialogData || null;

  ngOnInit(): void {
    this.settingsFacadeService.fetchStorageLimit().subscribe();
  }

  override onSave(): void {
    this.applicationForm()?.markAllAsTouched();
    this.nameError.set(null);

    if (!this.formValue()) {
      return;
    }

    this.saveTrigger$.next(this.formValue()!);
  }

  onFormValueChange(value: TApplicationFormEmitValue | null): void {
    this.formValue.set(value);
  }
}
