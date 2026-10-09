import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { TranslateService, TranslationObject } from 'hmdm-ui-kit';
import { Main } from './audit/pages/main/main';
import { environment } from '../environments/environment';

@Component({
  selector: 'audit-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [Main],
})
export class Plugin implements OnInit {
  private translate = inject(TranslateService); // This will be the shared instance
  private http = inject(HttpClient);

  ngOnInit() {
    this.loadRemoteTranslations();
  }

  private loadRemoteTranslations() {
    // Listen for language changes
    this.translate.onLangChange.subscribe((event) => {
      this.http
        .get<TranslationObject>(`${environment.i18nUrl}${event.lang}.json`)
        .subscribe((trans) => {
          this.translate.setTranslation(event.lang, trans, true);
        });
    });
  }
}
