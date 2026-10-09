import { Component, inject, OnInit, signal, Signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseComponent, LoaderDirective, SearchContainer } from 'hmdm-ui-kit';
import { ConfigurationsTable } from '../../components/configurations-table/configurations-table';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ConfigurationsFacadeService } from '../../services/configurations-facade.service';
import { ConfigurationsDialogService } from '../../services/configurations-dialog.service';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';

@Component({
  selector: 'core-configurations',
  templateUrl: './configurations.html',
  styleUrl: './configurations.scss',
  imports: [
    MatCardModule,
    MatButtonModule,
    TranslatePipe,
    LoaderDirective,
    SearchContainer,
    MatIconModule,
    MatDividerModule,
    ConfigurationsTable,
    HasPermissionDirective,
  ],
})
export class Configurations extends BaseComponent implements OnInit {
  private readonly configurationsFacadeService = inject(ConfigurationsFacadeService);
  private readonly configurationDialogService = inject(ConfigurationsDialogService);

  isLoadingConfigurations: Signal<boolean> = signal(false);
  configurationsSearchControl: FormControl<string> = new FormControl('', { nonNullable: true });

  ngOnInit(): void {
    this.configurationsSearchControl.valueChanges
      .pipe(this.untilDestroyed(), debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        const term = this.configurationsSearchControl.value;
        this.configurationsFacadeService.setSearchTerm(term);
      });
  }

  onAddConfigClick(): void {
    this.configurationDialogService.openCreateDialog();
  }
}
