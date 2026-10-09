import { Component, inject, input, InputSignal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BaseComponent, Checkbox, Selector, TextInputComponent, TranslatePipe } from 'hmdm-ui-kit';
import { ConfigurationService } from '../../../shared/services/configuration.service';
import { GroupService } from '../../../shared/services/group.service';
import { UsersFacadeService } from '../../services/users-facade.service';
import { TUserForm } from '../../types/user-form.type';
import { ALERT_LEVEL_OPTIONS } from '../../../entity/user/constants/alert-level.constant';

@Component({
  selector: 'core-user-form',
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss',
  imports: [ReactiveFormsModule, TextInputComponent, TranslatePipe, Checkbox, Selector],
})
export class UserForm extends BaseComponent {
  formGroup: InputSignal<FormGroup<TUserForm>> = input.required();

  private readonly groupsFacadeService: GroupService = inject(GroupService);
  private readonly configurationsFacadeService = inject(ConfigurationService);
  private readonly userFacadeService = inject(UsersFacadeService);

  configOptions = this.configurationsFacadeService.configOptions;
  groupOptions = this.groupsFacadeService.groupsOptions;
  rolesOptions = this.userFacadeService.userRoleOptions;
  alertLevelOptions = ALERT_LEVEL_OPTIONS;

  isAllConfigs(): boolean {
    return this.formGroup().controls.allConfigAvailable.value;
  }

  isAllGroups(): boolean {
    return this.formGroup().controls.allDevicesAvailable.value;
  }
}
