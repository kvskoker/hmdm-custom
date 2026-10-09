import { Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BaseCellRenderer, Checkbox } from 'hmdm-ui-kit';
import { ConfigurationDetailsFacadeService } from '../../services/configuration-details-facade.service';

@Component({
  selector: 'core-configuration-file-remove-cell',
  templateUrl: './configuration-file-remove-cell.html',
  styleUrl: './configuration-file-remove-cell.scss',
  imports: [Checkbox, ReactiveFormsModule],
})
export class ConfigurationFileRemoveCell extends BaseCellRenderer implements OnInit {
  private configurationDetailsFacadeService = inject(ConfigurationDetailsFacadeService);

  removeForm: FormControl<boolean> = new FormControl(false, { nonNullable: true });

  ngOnInit(): void {
    const data = this.params().data;

    if (data.remove) {
      this.removeForm.setValue(true, { emitEvent: false });
    }

    this.removeForm.valueChanges.pipe(this.untilDestroyed()).subscribe((value) => {
      this.configurationDetailsFacadeService.removeFileChange(data.id, value);
    });
  }
}
