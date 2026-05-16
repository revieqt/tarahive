import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";

import { LANGUAGES, LanguageItem } from "@/shared/constants/Languages";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type TranslationMap = Record<string, unknown>;

interface NamespaceBundle {
  [namespace: string]: TranslationMap;
}

interface PreloadResponse {
  version: number;
  data: NamespaceBundle;
}

interface LanguageContextValue {
  /** Translate a dot-separated key, e.g. "common.onboarding.title" */
  t: (key: string, params?: Record<string, string | number>) => string;
  /** The currently active language */
  currentLanguage: LanguageItem;
  /** Switch language by code (e.g. "ko") */
  setLanguage: (code: string) => Promise<void>;
  /**
   * Lazily load a namespace that was not part of the preload bundle.
   * Safe to call multiple times — uses the cache if already loaded.
   */
  loadNamespace: (namespace: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const BASE_URL = "http://localhost:5000/v1/localization";
const DEFAULT_LANGUAGE_CODE = "en";
const PRELOAD_NAMESPACES = ["auth", "common", "settings", "tabs"] as const;

/** TanStack Query key factories */
const queryKeys = {
  preload: (code: string) => ["localization", code, "preload"] as const,
  namespace: (code: string, ns: string) =>
    ["localization", code, "namespace", ns] as const,
};

// ─────────────────────────────────────────────
// Shared QueryClient (infinite stale time)
// ─────────────────────────────────────────────

export const localizationQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: Infinity,
      retry: 2,
    },
  },
});

// ─────────────────────────────────────────────
// Fetch helpers
// ─────────────────────────────────────────────

async function fetchPreload(code: string): Promise<NamespaceBundle> {
  const res = await fetch(`${BASE_URL}/${code}/preload`);
  if (!res.ok) throw new Error(`Preload failed for "${code}": ${res.status}`);
  const json: PreloadResponse = await res.json();
  return json.data;
}

async function fetchNamespace(
  code: string,
  namespace: string
): Promise<TranslationMap> {
  const res = await fetch(`${BASE_URL}/${code}/${namespace}`);
  if (!res.ok)
    throw new Error(
      `Namespace fetch failed for "${code}/${namespace}": ${res.status}`
    );
  return res.json();
}

// ─────────────────────────────────────────────
// Local fallback loader (en/common.json etc.)
// ─────────────────────────────────────────────

/**
 * Dynamically import every known EN namespace from locales/en/*.json.
 * Extend this map as new locale files are added.
 */
async function loadLocalEnBundle(): Promise<NamespaceBundle> {
  const modules = await Promise.allSettled([
    import("@/shared/locales/en/common.json"),
    import("@/shared/locales/en/auth.json"),
    import("@/shared/locales/en/settings.json"),
    import("@/shared/locales/en/tabs.json"),
  ]);

  const names = ["common", "auth", "settings", "tabs"];
  const bundle: NamespaceBundle = {};

  modules.forEach((result, i) => {
    if (result.status === "fulfilled") {
      const raw = (result.value as { default?: unknown }).default ?? result.value;
      bundle[names[i]] = raw as TranslationMap;
    }
  });

  return bundle;
}

// ─────────────────────────────────────────────
// Deep key resolver
// ─────────────────────────────────────────────

/**
 * Resolve a dot-separated key path within a nested object.
 * e.g. getNestedValue({ a: { b: "hello" } }, "a.b") → "hello"
 */
function getNestedValue(obj: TranslationMap, path: string): unknown {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (current != null && typeof current === "object") {
      return (current as Record<string, unknown>)[segment];
    }
    return undefined;
  }, obj);
}

/**
 * Simple interpolation: replace {{key}} or {key} placeholders.
 */
function interpolate(
  template: string,
  params?: Record<string, string | number>
): string {
  if (!params) return template;
  return template.replace(/\{\{?(\w+)\}?\}/g, (_, key) =>
    params[key] != null ? String(params[key]) : `{{${key}}}`
  );
}

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────

const LanguageContext = createContext<LanguageContextValue | null>(null);

// ─────────────────────────────────────────────
// Provider (inner — requires QueryClient in tree)
// ─────────────────────────────────────────────

function LanguageProviderInner({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const [currentLanguage, setCurrentLanguage] = useState<LanguageItem>(
    () => LANGUAGES.find((l) => l.code === DEFAULT_LANGUAGE_CODE)!
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * In-memory merged translation store for the active language.
   * Keyed by namespace so we can lazily add more.
   * We use a ref so that `t()` always reads the latest value without
   * re-creating the function on every render.
   */
  const translationsRef = useRef<NamespaceBundle>({});
  /** English fallback bundle */
  const fallbackRef = useRef<NamespaceBundle>({});
  /** Force re-render when translations change */
  const [translationVersion, setTranslationVersion] = useState(0);
  const bumpVersion = useCallback(
    () => setTranslationVersion((v) => v + 1),
    []
  );

  // ── Bootstrap: load EN fallback + EN preload ──────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setLoading(true);
      setError(null);

      try {
        // 1. Load local EN bundle as the primary fallback
        const localEn = await loadLocalEnBundle();
        fallbackRef.current = localEn;

        // 2. Attempt to fetch EN preload from backend (cached in QueryClient)
        let enBundle: NamespaceBundle;
        try {
          enBundle = await queryClient.fetchQuery({
            queryKey: queryKeys.preload(DEFAULT_LANGUAGE_CODE),
            queryFn: () => fetchPreload(DEFAULT_LANGUAGE_CODE),
          });
        } catch {
          // Backend unavailable — fall back to local files
          enBundle = localEn;
          // Still cache so subsequent calls don't re-fetch
          queryClient.setQueryData(
            queryKeys.preload(DEFAULT_LANGUAGE_CODE),
            enBundle
          );
        }

        if (!cancelled) {
          translationsRef.current = enBundle;
          // Keep fallback up to date with the best EN data we have
          fallbackRef.current = { ...localEn, ...enBundle };
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── setLanguage ───────────────────────────────────────────────────────

  const setLanguage = useCallback(
    async (code: string) => {
      const lang = LANGUAGES.find((l) => l.code === code);
      if (!lang) {
        console.warn(`[i18n] Unknown language code: "${code}"`);
        return;
      }

      // Switching back to EN is instant
      if (code === DEFAULT_LANGUAGE_CODE) {
        translationsRef.current = fallbackRef.current;
        setCurrentLanguage(lang);
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
        bumpVersion();
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        // Keep current language — do NOT switch on failure
        console.error(`[i18n] Failed to load language "${code}":`, e.message);
      } finally {
        setLoading(false);
      }
    },
    [queryClient, bumpVersion]
  );

  // ── loadNamespace ─────────────────────────────────────────────────────

  const loadNamespace = useCallback(
    async (namespace: string) => {
      const code = currentLanguage.code;

      // Check in-memory first
      if (translationsRef.current[namespace]) return;

      // Check TanStack cache
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

      // Fetch from backend
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

  // ── t() ───────────────────────────────────────────────────────────────

  /**
   * Translate a key.
   *
   * Key formats:
   *   - "common.onboarding.title"       → namespace "common", path "onboarding.title"
   *   - "title"                          → searches all namespaces in order
   */
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      // Suppress lint warning — we intentionally read translationVersion
      // so React knows to re-run this when translations update.
      void translationVersion;

      const translations = translationsRef.current;
      const fallback = fallbackRef.current;

      // Determine namespace + nested path
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
          // Search every namespace
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
        key; // Last resort: return the key itself

      return interpolate(raw, params);
    },
    [translationVersion]
  );

  // ─────────────────────────────────────────────
  // Value
  // ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// Public Provider (wraps its own QueryClientProvider)
// ─────────────────────────────────────────────

/**
 * Wrap your app (or navigation root) with this provider.
 *
 * If your app already has a `<QueryClientProvider>` higher in the tree
 * using `localizationQueryClient`, you can use `<LanguageProviderInner>`
 * directly instead.
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={localizationQueryClient}>
      <LanguageProviderInner>{children}</LanguageProviderInner>
    </QueryClientProvider>
  );
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a <LanguageProvider>");
  }
  return ctx;
}

// Re-export for convenience
export type { LanguageContextValue, LanguageItem, TranslationMap, NamespaceBundle };