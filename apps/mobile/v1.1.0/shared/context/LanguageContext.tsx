import React, { createContext ,useCallback, useContext, useEffect, useRef, useState } from "react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { LANGUAGES, LanguageItem } from "@/shared/constants/Languages";
import { enBundle } from "@/shared/locales/en";
import { api, setApiLanguage } from "@/shared/api/client";

type TranslationMap = Record<string, unknown>;
const DEFAULT_LANGUAGE_CODE = "en";

interface NamespaceBundle {
  [namespace: string]: TranslationMap;
}

interface PreloadResponse {
  version: number;
  data: NamespaceBundle;
}

interface LanguageContextValue {
  t: (key: string, params?: Record<string, string | number>) => string;
  currentLanguage: LanguageItem;
  setLanguage: (code: string) => Promise<void>;
  loadNamespace: (namespace: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

const queryKeys = {
  preload: (code: string) => ["localization", code, "preload"] as const,
  namespace: (code: string, ns: string) =>
    ["localization", code, "namespace", ns] as const,
};

async function fetchPreload(code: string): Promise<NamespaceBundle> {
  const response = await api.get<PreloadResponse>(`/v1/localization/${code}/preload`);
  return response.data;
}

async function fetchNamespace(
  code: string,
  namespace: string
): Promise<TranslationMap> {
  const response = await api.get<{ version: number; data: TranslationMap }>(
    `/v1/localization/${code}/${namespace}`
  );
  return response.data;
}

async function loadLocalEnBundle(): Promise<NamespaceBundle> {
  return enBundle as NamespaceBundle;
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
  params?: Record<string, string | number>
): string {
  if (!params) return template;
  return template.replace(/\{\{?(\w+)\}?\}/g, (_, key) =>
    params[key] != null ? String(params[key]) : `{{${key}}}`
  );
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function LanguageProviderInner({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const [currentLanguage, setCurrentLanguage] = useState<LanguageItem>(
    () => LANGUAGES.find((l) => l.code === DEFAULT_LANGUAGE_CODE)!
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const translationsRef = useRef<NamespaceBundle>({});
  const fallbackRef = useRef<NamespaceBundle>({});
  const [translationVersion, setTranslationVersion] = useState(0);
  const bumpVersion = useCallback(
    () => setTranslationVersion((v) => v + 1),
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setLoading(true);
      setError(null);

      try {
        const localEn = await loadLocalEnBundle();
        fallbackRef.current = localEn;
        let enBundle: NamespaceBundle;
        try {
          enBundle = await queryClient.fetchQuery({
            queryKey: queryKeys.preload(DEFAULT_LANGUAGE_CODE),
            queryFn: () => fetchPreload(DEFAULT_LANGUAGE_CODE),
          });
        } catch {
          enBundle = localEn;
          queryClient.setQueryData(
            queryKeys.preload(DEFAULT_LANGUAGE_CODE),
            enBundle
          );
        }

        if (!cancelled) {
          translationsRef.current = enBundle;
          fallbackRef.current = { ...localEn, ...enBundle };
          setApiLanguage(DEFAULT_LANGUAGE_CODE);
          bumpVersion();
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback(
    async (code: string) => {
      const lang = LANGUAGES.find((l) => l.code === code);
      if (!lang) {
        console.warn(`[i18n] Unknown language code: "${code}"`);
        return;
      }

      if (code === DEFAULT_LANGUAGE_CODE) {
        translationsRef.current = fallbackRef.current;
        setCurrentLanguage(lang);
        setApiLanguage(code);
        bumpVersion();
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const bundle = await queryClient.fetchQuery({
          queryKey: queryKeys.preload(code),
          queryFn: () => fetchPreload(code),
        });

        translationsRef.current = bundle;
        setCurrentLanguage(lang);
        setApiLanguage(code);
        bumpVersion();
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        console.error(`[i18n] Failed to load language "${code}":`, e.message);
      } finally {
        setLoading(false);
      }
    },
    [queryClient, bumpVersion]
  );

  const loadNamespace = useCallback(
    async (namespace: string) => {
      const code = currentLanguage.code;
      if (translationsRef.current[namespace]) return;
      const cached = queryClient.getQueryData<TranslationMap>(
        queryKeys.namespace(code, namespace)
      );
      if (cached) {
        translationsRef.current = {
          ...translationsRef.current,
          [namespace]: cached,
        };
        bumpVersion();
        return;
      }

      try {
        const data = await queryClient.fetchQuery({
          queryKey: queryKeys.namespace(code, namespace),
          queryFn: () => fetchNamespace(code, namespace),
        });

        translationsRef.current = {
          ...translationsRef.current,
          [namespace]: data,
        };
        bumpVersion();
      } catch (err) {
        console.error(
          `[i18n] Failed to load namespace "${namespace}" for "${code}":`,
          err
        );
        throw err;
      }
    },
    [currentLanguage.code, queryClient, bumpVersion]
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
          const val = getNestedValue(
            bundle[namespace] as TranslationMap,
            subKey
          );
          if (typeof val === "string") return val;
        }

        if (!namespace) {
          for (const ns of Object.keys(bundle)) {
            const val = getNestedValue(bundle[ns] as TranslationMap, subKey);
            if (typeof val === "string") return val;
          }
        }

        return undefined;
      };

      const raw =
        resolve(translations) ??
        resolve(fallback) ??
        key;

      return interpolate(raw, params);
    },
    [translationVersion]
  );

  const value: LanguageContextValue = {
    t,
    currentLanguage,
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
  return (
    <QueryClientProvider client={
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: Infinity,
            gcTime: Infinity,
            retry: 2,
          },
        },
      })
    }>
      <LanguageProviderInner>{children}</LanguageProviderInner>
    </QueryClientProvider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a <LanguageProvider>");
  }
  return ctx;
}

export type { LanguageContextValue, LanguageItem, TranslationMap, NamespaceBundle };