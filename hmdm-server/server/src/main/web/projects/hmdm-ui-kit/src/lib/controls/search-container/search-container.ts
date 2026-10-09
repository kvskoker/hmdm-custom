import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  signal,
  TemplateRef,
  WritableSignal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { PersistControlDirective } from '../../shared';
import { ClickOutsideDirective } from '../../shared/directives/click-outside.directive';

@Component({
  selector: 'hmdm-search-container',
  templateUrl: './search-container.html',
  styleUrl: './search-container.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatDivider,
    MatBadgeModule,
    TranslatePipe,
    ClickOutsideDirective,
    PersistControlDirective,
  ],
})
export class SearchContainer {
  activeFiltersCount: InputSignal<number> = input<number>(0);
  searchControl: InputSignal<FormControl<string | null>> =
    input.required<FormControl<string | null>>();
  filtersTemplate: InputSignal<TemplateRef<any> | null> = input<TemplateRef<any> | null>(null);
  showSearchButton: InputSignal<boolean> = input<boolean>(true);
  showFiltersButton: InputSignal<boolean> = input<boolean>(true);
  persistKey: InputSignal<string> = input.required<string>();

  searchClick: OutputEmitterRef<void> = output<void>();
  toggleFilters: OutputEmitterRef<void> = output<void>();

  isFiltersMenuOpen: WritableSignal<boolean> = signal<boolean>(false);

  onSearchClick(): void {
    this.isFiltersMenuOpen.set(false);
    this.searchClick.emit();
  }

  onToggleFilters(): void {
    this.isFiltersMenuOpen.set(!this.isFiltersMenuOpen());
    this.toggleFilters.emit();
  }

  onCloseFilters(): void {
    this.isFiltersMenuOpen.set(false);
  }

  @HostListener('keydown.enter', ['$event'])
  onEnterKeydown($event: Event): void {
    $event.preventDefault();
    this.onSearchClick();
  }
}
