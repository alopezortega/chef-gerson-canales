import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageService } from './language.service';

describe('LanguageService', () => {
  const translateUseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        LanguageService,
        {
          provide: TranslateService,
          useValue: {
            use: translateUseMock,
          },
        },
        {
          provide: PLATFORM_ID,
          useValue: 'browser',
        },
      ],
    });
  });

  it('should be created', () => {
    const service = TestBed.inject(LanguageService);

    expect(service).toBeTruthy();
  });

  it('should use Spanish as the default language', () => {
    const service = TestBed.inject(LanguageService);

    expect(service.currentLanguage()).toBe('es');
    expect(translateUseMock).toHaveBeenCalledWith('es');
  });

  it('should recover a valid language from localStorage', () => {
    localStorage.setItem('preferred-language', 'en');

    const service = TestBed.inject(LanguageService);

    expect(service.currentLanguage()).toBe('en');
    expect(translateUseMock).toHaveBeenCalledWith('en');
  });

  it('should use Spanish when the stored language is invalid', () => {
    localStorage.setItem('preferred-language', 'fr');

    const service = TestBed.inject(LanguageService);

    expect(service.currentLanguage()).toBe('es');
    expect(translateUseMock).toHaveBeenCalledWith('es');
  });

  it('should change and persist the selected language', () => {
    const service = TestBed.inject(LanguageService);

    service.changeLanguage('en');

    expect(service.currentLanguage()).toBe('en');
    expect(translateUseMock).toHaveBeenLastCalledWith('en');
    expect(localStorage.getItem('preferred-language')).toBe('en');
  });
});
