import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable } from '@angular/core';
import { TranslateService, TranslationObject } from '@ngx-translate/core';
import { AVAILABLE_LANGUAGES } from '../const/available-languages.const';
import { SettingsFacadeService } from './settings-facade.service';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly settingsFacadeService = inject(SettingsFacadeService);
  private readonly translateService = inject(TranslateService);
  private readonly http: HttpClient = inject(HttpClient);
  private readonly defaultLanguage = 'en_US';

  private currentLanguage: string | null = null;
  private useDefaultLanguage: boolean | null = null;

  constructor() {
    effect(() => {
      const settings = this.settingsFacadeService.settings();

      if (
        settings?.language !== this.currentLanguage ||
        settings?.useDefaultLanguage !== this.useDefaultLanguage
      ) {
        this.init();
        this.loadPluginTranslations();
      }
    });

    this.translateService.onLangChange.subscribe((event) => {
      this.currentLanguage = event.lang;

      if (!this.currentLanguage) {
        return;
      }

      this.loadPluginTranslations();
    });
  }

  loadPluginTranslations() {
    const plugins = (window as any)['__DYNPLUGINS__'] || [];

    if (!this.currentLanguage) {
      return;
    }

    plugins.forEach((plugin: any) => {
      this.http
        .get<TranslationObject>(`${plugin.baseUrl}/i18n/${this.currentLanguage}.json`)
        .subscribe((translations) => {
          if (!this.currentLanguage) {
            return;
          }

          // Merge with existing translations (true = merge, false = replace)
          this.translateService.setTranslation(this.currentLanguage, translations, true);
        });
    });
  }

  init(): void {
    const settings = this.settingsFacadeService.settings();

    if (!settings) {
      return;
    }

    if (settings.useDefaultLanguage) {
      const browserLang = this.getBrowserLanguage();
      const language = this.extractLanguageCode(browserLang);
      console.log('Setting language to browser language:', browserLang);

      this.useDefaultLanguage = true;
      this.currentLanguage = language;
      this.translateService.use(language);
    } else {
      const language = this.extractLanguageCode(settings.language || this.defaultLanguage);
      console.log('Setting language to configured language:', language);

      this.useDefaultLanguage = false;
      this.currentLanguage = language;
      this.translateService.use(language);
    }
  }

  private getBrowserLanguage(): string {
    const navigatorLang = navigator.language || (navigator as any).userLanguage;
    return navigatorLang ? this.extractLanguageCode(navigatorLang) : this.defaultLanguage;
  }

  private extractLanguageCode(lang: string): string {
    const languages = AVAILABLE_LANGUAGES;

    if (languages.includes(lang)) {
      return lang;
    }

    const partial = languages.find((l) => lang.startsWith(l.substring(0, 2)));

    return partial || this.defaultLanguage;
  }
}
