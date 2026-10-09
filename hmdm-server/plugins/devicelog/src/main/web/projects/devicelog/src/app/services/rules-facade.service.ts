import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { finalize, Observable, take } from 'rxjs';
import { TRuleDTO } from '../types/rule-dto.type';
import { RulesService } from './rules.service';

@Injectable({
  providedIn: 'root',
})
export class RulesFacadeService {
  private readonly rulesService = inject(RulesService);
  private readonly _rules: WritableSignal<TRuleDTO[]> = signal([]);

  readonly isLoadingRules: WritableSignal<boolean> = signal(false);
  readonly rules: Signal<TRuleDTO[]> = this._rules.asReadonly();

  constructor() {
    this.searchRules();
  }

  searchRules(): void {
    this.isLoadingRules.set(true);

    this.rulesService
      .search()
      .pipe(
        take(1),
        finalize(() => this.isLoadingRules.set(false)),
      )
      .subscribe((response) => {
        this._rules.set(response.rules);
      });
  }

  createRule(data: any): Observable<void> {
    return this.rulesService.create(data);
  }

  editRule(id: number, data: any): Observable<void> {
    return this.rulesService.edit({ id, ...data });
  }

  deleteRule(id: number): Observable<void> {
    return this.rulesService.delete(id);
  }
}
