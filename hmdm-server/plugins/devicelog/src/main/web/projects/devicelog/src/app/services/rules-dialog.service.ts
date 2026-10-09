import { inject, Injectable } from '@angular/core';
import { ConfirmDialog, MatDialog } from 'hmdm-ui-kit';
import { filter, switchMap, take, tap } from 'rxjs';
import { RuleDialog } from '../components/rule-dialog/rule-dialog';
import { TRuleDTO } from '../types/rule-dto.type';
import { RulesFacadeService } from './rules-facade.service';

@Injectable({
  providedIn: 'root',
})
export class RulesDialogService {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly rulesFacadeService = inject(RulesFacadeService);

  openNewRuleDialog(): void {
    this.dialog
      .open(RuleDialog)
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        switchMap((data) => this.rulesFacadeService.createRule(data)),
      )
      .subscribe(() => {
        this.rulesFacadeService.searchRules();
      });
  }

  openEditRuleDialog(rule: TRuleDTO): void {
    this.dialog
      .open(RuleDialog, {
        data: rule,
      })
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        switchMap((data) => this.rulesFacadeService.editRule(rule.id, data)),
      )
      .subscribe(() => {
        this.rulesFacadeService.searchRules();
      });
  }

  openDeleteRuleDialog(rule: TRuleDTO): void {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          title: '',
          message: 'plugin.devicelog.settings.question.delete.rule',
          confirmButtonText: 'button.delete',
          cancelButtonText: 'button.cancel',
          params: {
            rulename: rule.name,
          },
        },
      })
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        switchMap(() => {
          return this.rulesFacadeService.deleteRule(rule.id);
        }),
      )
      .subscribe(() => {
        this.rulesFacadeService.searchRules();
      });
  }
}
