import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as FileSystem from "expo-file-system/legacy";
import { LANGUAGES, LanguageItem } from "@/constants/Languages";
import { api, setApiLanguage } from "@/api/client";
import englishLocale from "../../assets/locales/en.json";

type TranslationMap = Record<string, unknown>;
type NamespaceBundle = Record<string, TranslationMap>;

interface LocaleBundle {
  language: LanguageItem;
  data: NamespaceBundle;
}

interface LanguageContextValue {
  t: (key: string, params?: Record<string, string | number>) => string;
  currentLanguage: LanguageItem;
  downloadedLanguages: LanguageItem[];
  setLanguage: (code: string) => Promise<void>;
  loadNamespace: (namespace: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

const DEFAULT_LANGUAGE_CODE = "en";
const defaultLocale = englishLocale as LocaleBundle;

function getLocaleDirectory(): string {
  if (!FileSystem.documentDirectory) {
    throw new Error("The device document directory is unavailable");
  }
  return `${FileSystem.documentDirectory}locales/`;
}

async function ensureLocaleDirectory(): Promise<string> {
  const directory = getLocaleDirectory();
  const info = await FileSystem.getInfoAsync(directory);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  }
  return directory;
}

function parseLocaleBundle(content: string, expectedCode: string): LocaleBundle {
  const locale = JSON.parse(content) as Partial<LocaleBundle>;
  if (
    !locale.language ||
    locale.language.code !== expectedCode ||
    typeof locale.language.name !== "string" ||
    typeof locale.language.nativeName !== "string" ||
    typeof locale.language.flag !== "string" ||
    !locale.data ||
    typeof locale.data !== "object" ||
    Array.isArray(locale.data)
  ) {
    throw new Error(`The downloaded locale "${expectedCode}" is invalid`);
  }
  return locale as LocaleBundle;
}

async function readDownloadedLocale(code: string): Promise<LocaleBundle | null> {
  const fileUri = `${getLocaleDirectory()}${code}.json`;
  const info = await FileSystem.getInfoAsync(fileUri);
  if (!info.exists) return null;
  return parseLocaleBundle(await FileSystem.readAsStringAsync(fileUri), code);
}

async function saveDownloadedLocale(locale: LocaleBundle): Promise<void> {
  const directory = await ensureLocaleDirectory();
  await FileSystem.writeAsStringAsync(
    `${directory}${locale.language.code}.json`,
    JSON.stringify(locale),
  );
}

function getDownloadedLanguageItems(codes: string[]): LanguageItem[] {
  return LANGUAGES.filter(
    (language) =>
      language.code !== DEFAULT_LANGUAGE_CODE && codes.includes(language.code),
  );
}

function getNestedValue(obj: TranslationMap, path: string): unknown {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (current != null && typeof current === "object") {
      return (current as Record<string, unknown>)[segment];
    }
    return undefined;
  }, obj);
}

function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template;
  return template.replace(/\{\{?(\w+)\}?\}/g, (_, key) =>
    params[key] != null ? String(params[key]) : `{{${key}}}`,
  );
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function LanguageProviderInner({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageItem>(
    defaultLocale.language,
  );
  const [downloadedLanguages, setDownloadedLanguages] = useState<LanguageItem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const translationsRef = useRef<NamespaceBundle>(defaultLocale.data);
  const fallbackRef = useRef<NamespaceBundle>(defaultLocale.data);
  const [translationVersion, setTranslationVersion] = useState(0);
  const bumpVersion = useCallback(
    () => setTranslationVersion((version) => version + 1),
    [],
  );

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setLoading(true);
      setError(null);

      try {
        const directory = await ensureLocaleDirectory();
        const filenames = await FileSystem.readDirectoryAsync(directory);
        const downloadedCodes = filenames
          .filter((filename) => filename.endsWith(".json"))
          .map((filename) => filename.slice(0, -5));

        if (!cancelled) {
          setDownloadedLanguages(getDownloadedLanguageItems(downloadedCodes));
          translationsRef.current = defaultLocale.data;
          fallbackRef.current = defaultLocale.data;
          setCurrentLanguage(defaultLocale.language);
          setApiLanguage(DEFAULT_LANGUAGE_CODE);
          bumpVersion();
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause : new Error(String(cause)));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [bumpVersion]);

  const setLanguage = useCallback(async (code: string) => {
    const availableLanguage = LANGUAGES.find((language) => language.code === code);
    if (!availableLanguage) {
      throw new Error(`Unknown language code: "${code}"`);
    }

    setLoading(true);
    setError(null);

    try {
      let locale: LocaleBundle;
      if (code === DEFAULT_LANGUAGE_CODE) {
        locale = defaultLocale;
      } else {
        const cachedLocale = await readDownloadedLocale(code);
        if (cachedLocale) {
          locale = cachedLocale;
        } else {
          const downloaded = await api.get<LocaleBundle>(
            `/v2/localization/${code}`,
          );
          locale = parseLocaleBundle(JSON.stringify(downloaded), code);
          await saveDownloadedLocale(locale);
          setDownloadedLanguages((current) =>
            getDownloadedLanguageItems([
              ...current.map((language) => language.code),
              code,
            ]),
          );
        }
      }

      translationsRef.current = locale.data;
      setCurrentLanguage(locale.language);
      setApiLanguage(code);
      bumpVersion();
    } catch (cause) {
      const languageError =
        cause instanceof Error ? cause : new Error(String(cause));
      setError(languageError);
      console.error(`[i18n] Failed to load language "${code}":`, languageError);
      throw languageError;
    } finally {
      setLoading(false);
    }
  }, [bumpVersion]);

  const loadNamespace = useCallback(
    async (namespace: string) => {
      if (
        !translationsRef.current[namespace] &&
        !fallbackRef.current[namespace]
      ) {
        throw new Error(`Translation namespace "${namespace}" is unavailable`);
      }
    },
    [],
  );

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      void translationVersion;

      const translations = translationsRef.current;
      const fallback = fallbackRef.current;

      const dotIndex = key.indexOf(".");
      const namespace = dotIndex !== -1 ? key.slice(0, dotIndex) : null;
      const subKey = dotIndex !== -1 ? key.slice(dotIndex + 1) : key;

      const resolve = (bundle: NamespaceBundle): string | undefined => {
        if (namespace && bundle[namespace]) {
          const value = getNestedValue(bundle[namespace], subKey);
          if (typeof value === "string") return value;
        }

        if (!namespace) {
          for (const ns of Object.keys(bundle)) {
            const value = getNestedValue(bundle[ns], subKey);
            if (typeof value === "string") return value;
          }
        }

        return undefined;
      };

      const raw = resolve(translations) ?? resolve(fallback) ?? key;
      return interpolate(raw, params);
    },
    [translationVersion],
  );

  const value: LanguageContextValue = {
    t,
    currentLanguage,
    downloadedLanguages,
    setLanguage,
    loadNamespace,
    loading,
    error,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return <LanguageProviderInner>{children}</LanguageProviderInner>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a <LanguageProvider>");
  }
  return context;
}

export type { LanguageContextValue, LocaleBundle, NamespaceBundle, TranslationMap };
