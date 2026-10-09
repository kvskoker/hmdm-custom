import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseComponent, LoaderDirective, SearchContainer } from 'hmdm-ui-kit';
import { IconTable } from '../../components/icon-table/icon-table';
import { IconFacadeService } from '../../services/icon-facade.service';
import { IconDialogService } from '../../services/icon-dialog.service';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'core-icons',
  templateUrl: './icons.html',
  styleUrl: './icons.scss',
  imports: [
    MatCardModule,
    MatButtonModule,
    TranslatePipe,
    LoaderDirective,
    SearchContainer,
    MatIconModule,
    MatDividerModule,
    IconTable,
  ],
})
export class Icons extends BaseComponent implements OnInit {
  private readonly iconFacadeService = inject(IconFacadeService);
  private readonly iconDialogService = inject(IconDialogService);

  iconsSearchControl = new FormControl<string>('', { nonNullable: true });
  isLoadingIcons = this.iconFacadeService.isLoading;

  ngOnInit(): void {
    this.iconsSearchControl.valueChanges
      .pipe(this.untilDestroyed(), debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.iconFacadeService.changeTerm(this.iconsSearchControl.value);
      });
  }

  onAddIconClick() {
    this.iconDialogService.openIconDialog();
  }
}
