import {
  Component,
  computed,
  inject,
  input,
  InputSignal,
  OnInit,
  output,
  OutputEmitterRef,
  Signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslatePipe } from '@ngx-translate/core';
import {
  Datepicker,
  Selector,
  TextAreaInputComponent,
  TextInputComponent,
  TOption,
} from 'hmdm-ui-kit';
import { startWith } from 'rxjs';
import { TCustomerDTO } from '../../../entity/customer/types/customer-dto.type';
import { ConfigurationService } from '../../../shared/services/configuration.service';
import { CustomerFormConfig } from '../../configuration/customer-form.config';
import { TCustomerFormValue } from '../../types/customer-form-value.type';

@Component({
  selector: 'core-customer-form',
  templateUrl: './customer-form.html',
  styleUrl: './customer-form.scss',
  imports: [
    ReactiveFormsModule,
    TextInputComponent,
    TextAreaInputComponent,
    Selector,
    Datepicker,
    MatCheckboxModule,
    TranslatePipe,
  ],
})
export class CustomerForm implements OnInit {
  initialData: InputSignal<TCustomerDTO | null> = input<TCustomerDTO | null>(null);
  isNew: InputSignal<boolean> = input<boolean>(false);
  formChange: OutputEmitterRef<TCustomerFormValue> = output();

  private readonly customerFormConfig = inject(CustomerFormConfig);
  private readonly configurationService = inject(ConfigurationService);

  formGroup = this.customerFormConfig.getFormGroup();

  readonly accountTypeOptions: TOption<number>[] = [
    { value: 0, viewValue: 'customer.type.demo' },
    { value: 1, viewValue: 'customer.type.small' },
    { value: 2, viewValue: 'customer.type.corporate' },
  ];

  readonly customerStatusOptions: TOption<string>[] = [
    { value: 'customer.new', viewValue: 'customer.new' },
    { value: 'customer.active', viewValue: 'customer.active' },
    { value: 'customer.need.followup', viewValue: 'customer.need.followup' },
    { value: 'customer.followup.sent', viewValue: 'customer.followup.sent' },
    { value: 'customer.internal.test', viewValue: 'customer.internal.test' },
    { value: 'customer.developer', viewValue: 'customer.developer' },
    { value: 'customer.difficult', viewValue: 'customer.difficult' },
    { value: 'customer.inactive', viewValue: 'customer.inactive' },
    { value: 'customer.pause', viewValue: 'customer.pause' },
    { value: 'customer.abandon', viewValue: 'customer.abandon' },
    { value: 'customer.denial', viewValue: 'customer.denial' },
    { value: 'customer.onpremise', viewValue: 'customer.onpremise' },
    { value: 'customer.client', viewValue: 'customer.client' },
  ];

  configurationOptions = this.configurationService.configOptions;

  private readonly selectedConfigIds: Signal<number[]> = toSignal(
    this.formGroup.controls.configurationIds.valueChanges.pipe(startWith([])),
    { initialValue: [] },
  );

  filteredConfigOptions: Signal<TOption<number>[]> = computed(() => {
    const selected = this.selectedConfigIds();
    if (!selected || selected.length === 0) return [];
    const selectedSet = new Set(selected);
    return this.configurationOptions().filter((opt) => selectedSet.has(opt.value));
  });

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const data = this.initialData();

    if (data) {
      this.formGroup.patchValue({
        name: data.name ?? '',
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
        language: data.language ?? '',
        email: data.email ?? '',
        description: data.description ?? '',
        accountType: data.accountType ?? null,
        customerStatus: data.customerStatus ?? null,
        expiryTime: data.expiryTime ? new Date(data.expiryTime) : null,
        deviceLimit: data.deviceLimit ?? 3,
        sizeLimit: data.sizeLimit ?? null,
        prefix: data.prefix ?? '',
        deviceConfigurationId: data.deviceConfigurationId ?? null,
      });
    }

    if (this.isNew()) {
      this.formGroup.controls.configurationIds.valueChanges.subscribe((ids) => {
        const currentId = this.formGroup.controls.deviceConfigurationId.value;
        if (currentId !== null && !ids.includes(currentId)) {
          this.formGroup.controls.deviceConfigurationId.setValue(null);
        }
      });
    } else {
      this.formGroup.controls.prefix.disable();
      this.formGroup.controls.deviceConfigurationId.disable();
    }

    this.formGroup.valueChanges.subscribe(() => {
      this.formChange.emit(this.formGroup.getRawValue());
    });
  }

  markAllAsTouched(): void {
    this.formGroup.markAllAsTouched();
  }

  get isValid(): boolean {
    return this.formGroup.valid;
  }
}
