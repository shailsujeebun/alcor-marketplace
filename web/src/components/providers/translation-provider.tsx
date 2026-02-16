'use client';

import { Button } from '@/components/ui/button';
import { type Locale, type TranslationParams, translate } from '@/i18n';
import { Languages } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface TranslationContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string, params?: TranslationParams) => string;
}

const TranslationContext = createContext<TranslationContextValue>({
  locale: 'uk',
  setLocale: () => {},
  toggleLocale: () => {},
  t: (key: string) => key,
});

export function useTranslation() {
  return useContext(TranslationContext);
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('uk');

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === 'uk' ? 'en' : 'uk'));
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback(
    (key: string, params?: TranslationParams) => translate(locale, key, params),
    [locale],
  );

  const contextValue = useMemo(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t,
    }),
    [locale, toggleLocale, t],
  );

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}

      <div data-no-translate className="fixed bottom-4 right-4 z-[80]">
        <Button
          type="button"
          variant="outline"
          className="border-[var(--border-color)] bg-[var(--bg-secondary)]/85 backdrop-blur text-[var(--text-primary)] shadow-md"
          onClick={toggleLocale}
          title={locale === 'uk' ? t('translation.toEnglish') : t('translation.toUkrainian')}
        >
          <Languages className="w-4 h-4 mr-2" />
          {locale === 'uk' ? 'EN' : 'UA'}
        </Button>
      </div>
    </TranslationContext.Provider>
  );
}
