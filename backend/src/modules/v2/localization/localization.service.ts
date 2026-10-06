import fs from 'fs';
import path from 'path';

export interface LocaleBundle {
  language: {
    code: string;
    name: string;
    nativeName: string;
    flag: string;
    isRTL: boolean;
  };
  data: Record<string, unknown>;
}

const localesPath = path.join(__dirname, 'locales');
const backendLocalesPath = path.join(__dirname, 'backend');
const DEFAULT_LANG = 'en';

function localeFilePath(lang: string): string {
  if (!/^[a-z]{2,3}$/.test(lang)) {
    throw new Error(`Unsupported language: ${lang}`);
  }
  return path.join(localesPath, `${lang}.json`);
}

export function getSupportedLanguages(): string[] {
  if (!fs.existsSync(localesPath)) return [];
  return fs
    .readdirSync(localesPath)
    .filter((file) => /^[a-z]{2,3}\.json$/.test(file))
    .map((file) => path.basename(file, '.json'));
}

export function getLocale(lang: string): LocaleBundle {
  const filePath = localeFilePath(lang);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Language ${lang} not found`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as LocaleBundle;
}

export function detectLanguage(acceptLanguageHeader?: string): string {
  const supported = getSupportedLanguages();
  if (!acceptLanguageHeader) return DEFAULT_LANG;

  const candidates = acceptLanguageHeader
    .split(',')
    .map((entry) => {
      const [locale, ...parameters] = entry.trim().split(';');
      const qualityParameter = parameters.find((parameter) =>
        parameter.trim().startsWith('q='),
      );
      const quality = qualityParameter
        ? Number.parseFloat(qualityParameter.trim().slice(2))
        : 1;
      return {
        locale: locale.trim().replace('-', '_').toLowerCase(),
        quality: Number.isFinite(quality) ? quality : 0,
      };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { locale } of candidates) {
    const exact = locale.replace('_', '-');
    if (supported.includes(exact)) return exact;
    const base = locale.split(/[-_]/)[0];
    if (supported.includes(base)) return base;
  }

  return DEFAULT_LANG;
}

const backendLocaleCache: Record<string, Record<string, unknown>> = {};

function loadBackendLocale(lang: string): Record<string, unknown> {
  if (!/^[a-z]{2,3}$/.test(lang)) return {};
  if (backendLocaleCache[lang]) return backendLocaleCache[lang];

  const filePath = path.join(backendLocalesPath, `${lang}.json`);
  if (!fs.existsSync(filePath)) return {};

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Record<
    string,
    unknown
  >;
  backendLocaleCache[lang] = data;
  return data;
}

export function t(key: string, lang: string = DEFAULT_LANG): string {
  const [namespace, ...pathParts] = key.split('.');

  if (!namespace || pathParts.length === 0) {
    console.warn(
      `[i18n] Invalid key format: "${key}". Expected "<namespace>.<key>"`,
    );
    return key;
  }

  for (const locale of Array.from(new Set([lang, DEFAULT_LANG]))) {
    const bundle = loadBackendLocale(locale);
    const value = pathParts.reduce<unknown>((current, part) => {
      if (current && typeof current === 'object') {
        return (current as Record<string, unknown>)[part];
      }
      return undefined;
    }, bundle[namespace]);
    if (typeof value === 'string') return value;
  }

  console.warn(`[i18n] Missing translation: "${key}" (lang: ${lang})`);
  return key;
}
