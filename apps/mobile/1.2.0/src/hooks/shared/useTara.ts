import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
	TARA_MESSAGES_EN,
	TARA_MESSAGES_JA,
	TARA_MESSAGES_KO,
	TARA_MESSAGES_ZH,
} from "@/constants/TaraMessages";
import {
	TARA_AI_SUGGESTIONS_EN,
	TARA_AI_SUGGESTIONS_JA,
	TARA_AI_SUGGESTIONS_KO,
	TARA_AI_SUGGESTIONS_ZH,
} from "@/constants/TaraSuggestions";

export type TaraContentType = "messages" | "suggestions";

const taraContent = {
	messages: {
		en: TARA_MESSAGES_EN,
		ko: TARA_MESSAGES_KO,
		zh: TARA_MESSAGES_ZH,
		ja: TARA_MESSAGES_JA,
	},
	suggestions: {
		en: TARA_AI_SUGGESTIONS_EN,
		ko: TARA_AI_SUGGESTIONS_KO,
		zh: TARA_AI_SUGGESTIONS_ZH,
		ja: TARA_AI_SUGGESTIONS_JA,
	},
} as const;

function getRandomContent(type: TaraContentType, languageCode: string): string {
	const options = taraContent[type][languageCode as keyof (typeof taraContent)[typeof type]]
		?? taraContent[type].en;
	return options[Math.floor(Math.random() * options.length)];
}

export function useTara(type: TaraContentType): string {
	const { currentLanguage } = useLanguage();
	const [content, setContent] = useState(() =>
		getRandomContent(type, currentLanguage.code)
	);

	useEffect(() => {
		setContent(getRandomContent(type, currentLanguage.code));
	}, [type, currentLanguage.code]);

	return content;
}
