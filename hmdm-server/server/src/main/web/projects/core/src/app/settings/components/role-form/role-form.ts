import { Component, inject, input, InputSignal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Selector, TextInputComponent, TranslatePipe } from 'hmdm-ui-kit';
import { RoleFacadeService } from '../../services/role-facade.service';
import { TRoleForm } from '../../types/role-form.type';

@Component({
  selector: 'core-role-form',
  templateUrl: './role-form.html',
  styleUrl: './role-form.scss',
  imports: [ReactiveFormsModule, TextInputComponent, Selector, TranslatePipe],
})
export class RoleForm {
  formGroup: InputSignal<FormGroup<TRoleForm>> = input.required();

  private readonly roleFacadeService: RoleFacadeService = inject(RoleFacadeService);

  permissionsOptions = this.roleFacadeService.permissionOptions;
}
