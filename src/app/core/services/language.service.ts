import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { SupportedLanguage } from '../models/supported-language.type';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly defaultLanguage: SupportedLanguage = 'es';
  private readonly languageStorageKey = 'preferred-language';

  // Injects the platform identifier so the service can detect whether it is running in the browser or on the server.
  private readonly platformId = inject(PLATFORM_ID);
  private readonly translateService = inject(TranslateService);

  private readonly currentLanguageSignal = signal<SupportedLanguage>(this.defaultLanguage);

  readonly currentLanguage = this.currentLanguageSignal.asReadonly();

  constructor() {
    const initialLanguage = this.getInitialLanguage();

    this.currentLanguageSignal.set(initialLanguage);
    this.translateService.use(initialLanguage);
  }

  changeLanguage(language: SupportedLanguage): void {
    this.currentLanguageSignal.set(language);
    this.translateService.use(language);

    // Checks whether the code is executing in a browser environment before using localStorage.
    // This prevents server-side rendering errors because localStorage is not available on the server.
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.languageStorageKey, language);
    }
  }

  private getInitialLanguage(): SupportedLanguage {
    // If the app is running on the server, return the default language instead of trying to read browser storage.
    if (!isPlatformBrowser(this.platformId)) {
      return this.defaultLanguage;
    }

    // Reads the previously saved language from localStorage only when the code is running in the browser.
    const storedLanguage = localStorage.getItem(this.languageStorageKey);

    return this.isSupportedLanguage(storedLanguage) ? storedLanguage : this.defaultLanguage;
  }

  private isSupportedLanguage(language: string | null): language is SupportedLanguage {
    return language === 'es' || language === 'en';
  }
}
