import { enMessages } from './messages/en';
import { ukMessages } from './messages/uk';

export type Locale = 'uk' | 'en';
export type TranslationParams = Record<string, string | number>;

const messagesByLocale = {
  uk: ukMessages,
  en: enMessages,
} as const;

function getByPath(source: unknown, path: string): unknown {
  if (!source || typeof source !== 'object') return undefined;
  return path.split('.').reduce<unknown>((acc, segment) => {
    if (!acc || typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[segment];
  }, source);
}

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = params[key];
    return value === undefined ? match : String(value);
  });
}

export function translate(locale: Locale, key: string, params?: TranslationParams): string {
  const localeValue = getByPath(messagesByLocale[locale], key);
  const fallbackValue = getByPath(messagesByLocale.uk, key);
  const resolved = typeof localeValue === 'string'
    ? localeValue
    : typeof fallbackValue === 'string'
      ? fallbackValue
      : key;

  return interpolate(resolved, params);
}
