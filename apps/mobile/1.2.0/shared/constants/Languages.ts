export interface LanguageItem {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isRTL?: boolean;
}

export const LANGUAGES: LanguageItem[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
  },
  {
    code: "fil",
    name: "Filipino",
    nativeName: "Filipino",
    flag: "🇵🇭",
  },
  {
    code: "ko",
    name: "Korean",
    nativeName: "한국어",
    flag: "🇰🇷",
  },
];