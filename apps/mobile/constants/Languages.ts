export interface LanguageItem {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  backendPath: string;
  isRTL?: boolean;
}

export const LANGUAGES: LanguageItem[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    backendPath: "/api/locales/en",
  },

  {
    code: "fil",
    name: "Filipino",
    nativeName: "Filipino",
    flag: "🇵🇭",
    backendPath: "/api/locales/fil",
  },

  {
    code: "ceb",
    name: "Cebuano",
    nativeName: "Bisaya",
    flag: "🇵🇭",
    backendPath: "/api/locales/ceb",
  },
];