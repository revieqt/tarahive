// localization/localization.service.ts

import fs from 'fs';
import path from 'path';

const localesPath = path.join(__dirname, 'locales');

// ─── File I/O ─────────────────────────────────────────────────────────────────

export async function getTranslations(
  lang: string,
  namespace: string,
): Promise<Record<string, any>> {
  const filePath = path.join(localesPath, lang, `${namespace}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Translation not found for ${lang}/${namespace}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export async function getAllTranslations(
  lang: string,
): Promise<Record<string, any>> {
  const langPath = path.join(localesPath, lang);
  if (!fs.existsSync(langPath)) {
    throw new Error(`Language ${lang} not found`);
  }

  const result: Record<string, any> = {};
  for (const file of fs.readdirSync(langPath)) {
    if (!file.endsWith('.json')) continue;
    const namespace = path.basename(file, '.json');
    result[namespace] = JSON.parse(
      fs.readFileSync(path.join(langPath, file), 'utf-8'),
    );
  }
  return result;
}

export async function getPreloadTranslations(
  lang: string,
): Promise<Record<string, any>> {
  const langPath = path.join(localesPath, lang);
  if (!fs.existsSync(langPath)) {
    throw new Error(`Language ${lang} not found`);
  }

  const namespaces = ['common', 'auth', 'settings', 'tabs'];
  const result: Record<string, any> = {};

  for (const namespace of namespaces) {
    try {
      result[namespace] = await getTranslations(lang, namespace);
    } catch (err: any) {
      // If a namespace doesn't exist, use empty object
      result[namespace] = {};
    }
  }

  return result;
}

// ─── Language detection ───────────────────────────────────────────────────────

const SUPPORTED_LANGS = fs.existsSync(localesPath)
  ? fs.readdirSync(localesPath).filter((f) =>
      fs.statSync(path.join(localesPath, f)).isDirectory(),
    )
  : [];

const DEFAULT_LANG = 'en';

console.log('Supported languages:', SUPPORTED_LANGS);
console.log('Locales path:', localesPath);

export function detectLanguage(acceptLanguageHeader?: string): string {
  if (!acceptLanguageHeader) return DEFAULT_LANG;

  const candidates = acceptLanguageHeader
    .split(',')
    .map((entry) => {
      const [locale, q] = entry.trim().split(';q=');
      return {
        locale: locale.trim().replace('-', '_'),
        quality: q ? parseFloat(q) : 1.0,
      };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { locale } of candidates) {
    if (SUPPORTED_LANGS.includes(locale)) return locale;
    const base = locale.split('_')[0];
    if (SUPPORTED_LANGS.includes(base)) return base;
  }

  return DEFAULT_LANG;
}

// ─── t() ─────────────────────────────────────────────────────────────────────

const cache: Record<string, Record<string, any>> = {};

function loadNamespace(lang: string, namespace: string): Record<string, any> {
  if (cache[lang]?.[namespace]) return cache[lang][namespace];

  const filePath = path.join(localesPath, lang, `${namespace}.json`);
  if (!fs.existsSync(filePath)) return {};

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  cache[lang] ??= {};
  cache[lang][namespace] = data;
  return data;
}

export function t(key: string, lang: string = DEFAULT_LANG): string {
  const [namespace, ...pathParts] = key.split('.');

  if (!namespace || pathParts.length === 0) {
    console.warn(`[i18n] Invalid key format: "${key}". Expected "<namespace>.<key>"`);
    return key;
  }

  for (const l of Array.from(new Set([lang, DEFAULT_LANG]))) {
    const ns = loadNamespace(l, namespace);
    const value = pathParts.reduce<any>(
      (obj, part) => (obj && typeof obj === 'object' ? obj[part] : undefined),
      ns,
    );
    if (typeof value === 'string') return value;
  }

  console.warn(`[i18n] Missing translation: "${key}" (lang: ${lang})`);
  return key;
}