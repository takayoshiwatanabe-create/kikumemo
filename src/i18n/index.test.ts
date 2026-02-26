import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { I18nProvider, useI18n, getDeviceLanguage, Language } from './index';
import { translations } from './translations';
import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';

// Mock i18next and react-i18next
vi.mock('i18next', () => ({
  default: {
    use: vi.fn().mockReturnThis(),
    init: vi.fn(),
    changeLanguage: vi.fn(),
    t: vi.fn((key: string, options?: Record<string, string | number>) => {
      let text = translations.en[key as keyof typeof translations.en] || key;
      if (options) {
        for (const [k, v] of Object.entries(options)) {
          text = text.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), String(v));
        }
      }
      return text;
    }),
    language: 'en',
  },
}));

vi.mock('react-i18next', () => ({
  I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
  useTranslation: () => ({
    t: vi.fn((key: string, options?: Record<string, string | number>) => {
      let text = translations.en[key as keyof typeof translations.en] || key;
      if (options) {
        for (const [k, v] of Object.entries(options)) {
          text = text.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), String(v));
        }
      }
      return text;
    }),
    i18n: {
      changeLanguage: vi.fn(),
      language: 'en',
    },
  }),
}));

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({
    get: vi.fn(),
  })),
}));

describe('getDeviceLanguage', () => {
  it('returns default language "ja" if no accept-language header is present', () => {
    const mockHeaders = {
      get: vi.fn(() => null),
    } as unknown as ReadonlyHeaders;
    expect(getDeviceLanguage(mockHeaders)).toBe('ja');
  });

  it('returns "ja" for Japanese preference', () => {
    const mockHeaders = {
      get: vi.fn(() => 'ja,en-US;q=0.9,en;q=0.8'),
    } as unknown as ReadonlyHeaders;
    expect(getDeviceLanguage(mockHeaders)).toBe('ja');
  });

  it('returns "en" for English preference', () => {
    const mockHeaders = {
      get: vi.fn(() => 'en-US,en;q=0.9,ja;q=0.8'),
    } as unknown as ReadonlyHeaders;
    expect(getDeviceLanguage(mockHeaders)).toBe('en');
  });

  it('returns "zh" for Chinese preference', () => {
    const mockHeaders = {
      get: vi.fn(() => 'zh-CN,zh;q=0.9,en;q=0.8'),
    } as unknown as ReadonlyHeaders;
    expect(getDeviceLanguage(mockHeaders)).toBe('zh');
  });

  it('returns "ar" for Arabic preference (RTL language)', () => {
    const mockHeaders = {
      get: vi.fn(() => 'ar-EG,ar;q=0.9,en;q=0.8'),
    } as unknown as ReadonlyHeaders;
    expect(getDeviceLanguage(mockHeaders)).toBe('ar');
  });

  it('returns the first supported language from the accept-language header', () => {
    const mockHeaders = {
      get: vi.fn(() => 'fr-CA,fr;q=0.9,de;q=0.8,en;q=0.7'),
    } as unknown as ReadonlyHeaders;
    expect(getDeviceLanguage(mockHeaders)).toBe('fr');
  });

  it('falls back to default if no supported language is found', () => {
    const mockHeaders = {
      get: vi.fn(() => 'xx-YY,zz;q=0.9'),
    } as unknown as ReadonlyHeaders;
    expect(getDeviceLanguage(mockHeaders)).toBe('ja');
  });
});

describe('useI18n', () => {
  beforeEach(() => {
    // Reset i18next mock before each test
    const i18next = require('i18next').default;
    i18next.changeLanguage.mockClear();
    i18next.t.mockClear();
    i18next.language = 'en'; // Default language for the mock
  });

  it('returns the initial locale and translation function', () => {
    const { result } = renderHook(() => useI18n(), {
      wrapper: ({ children }) => <I18nProvider initialLocale="en">{children}</I18nProvider>,
    });

    expect(result.current.lang).toBe('en');
    expect(result.current.t('header.appName')).toBe('KikuMemo');
  });

  it('changes language correctly using setLanguage', async () => {
    const i18next = require('i18next').default;
    const { result } = renderHook(() => useI18n(), {
      wrapper: ({ children }) => <I18nProvider initialLocale="en">{children}</I18nProvider>,
    });

    act(() => {
      result.current.setLanguage('ja');
    });

    expect(i18next.changeLanguage).toHaveBeenCalledWith('ja');
    // The mock i18next.language would be updated in a real scenario,
    // but here we rely on the mock's internal state or a re-render.
    // For this test, we check if the `changeLanguage` function was called.
  });

  it('correctly identifies RTL language', () => {
    const { result: enResult } = renderHook(() => useI18n(), {
      wrapper: ({ children }) => <I18nProvider initialLocale="en">{children}</I18nProvider>,
    });
    expect(enResult.current.isRTL).toBe(false);

    const { result: arResult } = renderHook(() => useI18n(), {
      wrapper: ({ children }) => <I18nProvider initialLocale="ar">{children}</I18nProvider>,
    });
    expect(arResult.current.isRTL).toBe(true);
  });

  it('translates with variables', () => {
    const { result } = renderHook(() => useI18n(), {
      wrapper: ({ children }) => <I18nProvider initialLocale="en">{children}</I18nProvider>,
    });

    const translated = result.current.t('dashboard.welcomeMessage', { name: 'Test User' });
    expect(translated).toBe('Welcome, Test User!');
  });

  it('provides all supported languages', () => {
    const { result } = renderHook(() => useI18n(), {
      wrapper: ({ children }) => <I18nProvider initialLocale="en">{children}</I18nProvider>,
    });

    const expectedLanguages: Language[] = [
      'ja', 'en', 'zh', 'ko', 'es', 'fr', 'de', 'pt', 'ar', 'hi',
    ];
    expect(result.current.supportedLanguages).toEqual(expectedLanguages);
  });
});
