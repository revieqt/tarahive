import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from '@/context/SessionContext';
import {
  aiChatService,
  type AiChatResponse,
  type AiMessage,
} from '@/services/aiChatService';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'chat' | 'itinerary';
  itineraryData?: Record<string, any>;
}

const STORAGE_KEYS = {
  LAST_MESSAGE_COUNT_DATE: 'last_message_count_date',
  MESSAGE_COUNT_TODAY: 'message_count_today',
};

const createWelcomeMessage = (): Message => ({
  id: 'welcome-message',
  text: "Hello, I'm Tara! Your personal travel assistant! What would you like to explore today?",
  isUser: false,
  timestamp: new Date(),
  type: 'chat',
});

const parseItineraryPayload = (rawContent: string): { text: string; itineraryData?: Record<string, any> } => {
  const normalized = rawContent?.trim() ?? '';

  if (!normalized) {
    return { text: '' };
  }

  try {
    const trimmed = normalized.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(trimmed);

    if (!parsed || typeof parsed !== 'object') {
      return { text: rawContent };
    }

    const itineraryData =
      parsed.itineraryData ??
      parsed.itinerary ??
      parsed.data?.itinerary ??
      parsed.data;

    if (itineraryData && typeof itineraryData === 'object' && (
      'title' in itineraryData ||
      'startDate' in itineraryData ||
      'endDate' in itineraryData ||
      'content' in itineraryData
    )) {
      const text = typeof parsed.message === 'string'
        ? parsed.message
        : typeof parsed.text === 'string'
          ? parsed.text
          : 'Here is a draft itinerary for review.';

      return {
        text,
        itineraryData: itineraryData as Record<string, any>,
      };
    }
  } catch {
    // Ignore parse failures and fall back to plain text.
  }

  return { text: rawContent };
};

const mapStoredMessages = (messages: AiMessage[] = []): Message[] =>
  messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .map((message) => {
      const parsed = parseItineraryPayload(message.content);

      return {
        id: message.id,
        text: parsed.text,
        isUser: message.role === 'user',
        timestamp: new Date(message.createdAt ?? Date.now()),
        type: parsed.itineraryData ? 'itinerary' : 'chat',
        itineraryData: parsed.itineraryData,
      };
    });

export const useAiChat = () => {
  const { session } = useSession();
  const usageLimitsEnabled = process.env.EXPO_PUBLIC_ENABLE_AI_USAGE_LIMITS === 'true';
  const maxMessages = useMemo(
    () => parseInt(process.env.EXPO_PUBLIC_MAX_FREE_AI_MESSAGES_PER_DAY || '5', 10),
    [],
  );

  const [messages, setMessages] = useState<Message[]>([createWelcomeMessage()]);
  const [isSending, setIsSending] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [inputText, setInputText] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [todayMessageCount, setTodayMessageCount] = useState(0);
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadTodayMessageCount = useCallback(async () => {
    try {
      const today = new Date().toDateString();
      const lastDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_MESSAGE_COUNT_DATE);
      const count = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGE_COUNT_TODAY);

      if (lastDate && lastDate !== today) {
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_MESSAGE_COUNT_DATE, today);
        await AsyncStorage.setItem(STORAGE_KEYS.MESSAGE_COUNT_TODAY, '0');
        setTodayMessageCount(0);
        return;
      }

      if (!lastDate) {
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_MESSAGE_COUNT_DATE, today);
      }

      setTodayMessageCount(count ? parseInt(count, 10) : 0);
    } catch (error) {
      console.error('Failed to load message count:', error);
    }
  }, []);

  const loadConversation = useCallback(async () => {
    try {
      const response = await aiChatService.getConversation();
      const storedMessages = response.messages ?? [];

      if (!storedMessages.length) {
        setMessages([createWelcomeMessage()]);
        return;
      }

      setMessages(mapStoredMessages(storedMessages));
    } catch (error) {
      console.error('Failed to load conversation:', error);
      setMessages([createWelcomeMessage()]);
    }
  }, []);

  useEffect(() => {
    void loadTodayMessageCount();
    void loadConversation();
  }, [loadTodayMessageCount, loadConversation]);

  useEffect(() => {
    const isProUser = Boolean(session?.user?.isProUser);

    if (usageLimitsEnabled && !isProUser && todayMessageCount >= maxMessages) {
      setRateLimitError(
        `You've reached your daily limit of ${maxMessages} messages. Upgrade to Pro for unlimited access.`,
      );
      return;
    }

    setRateLimitError(null);
  }, [maxMessages, session?.user?.isProUser, todayMessageCount, usageLimitsEnabled]);

  const validateMessage = useCallback((text: string): string | null => {
    const trimmed = text.trim();

    if (!trimmed) {
      return 'Please enter a message before sending.';
    }

    if (trimmed.length > 2000) {
      return 'Message must be 2000 characters or fewer.';
    }

    return null;
  }, []);

  const incrementFreeMessageCount = useCallback(async () => {
    if (!usageLimitsEnabled || session?.user?.isProUser) {
      return;
    }

    const nextCount = todayMessageCount + 1;
    setTodayMessageCount(nextCount);

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MESSAGE_COUNT_TODAY, String(nextCount));
    } catch (error) {
      console.error('Failed to save message count:', error);
    }
  }, [session?.user?.isProUser, todayMessageCount, usageLimitsEnabled]);

  const handleSendMessage = useCallback(
    async (rawText: string) => {
      const validationError = validateMessage(rawText);
      if (validationError) {
        setInputError(validationError);
        return;
      }

      setInputError(null);

      const isProUser = Boolean(session?.user?.isProUser);
      if (usageLimitsEnabled && !isProUser && todayMessageCount >= maxMessages) {
        setRateLimitError(
          `You've reached your daily limit of ${maxMessages} messages. Upgrade to Pro for unlimited access.`,
        );
        return;
      }

      const trimmedText = rawText.trim();
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        text: trimmedText,
        isUser: true,
        timestamp: new Date(),
        type: 'chat',
      };

      const assistantId = `assistant-${Date.now()}`;
      const assistantPlaceholder: Message = {
        id: assistantId,
        text: '',
        isUser: false,
        timestamp: new Date(),
        type: 'chat',
      };

      setMessages((prev) => prev.filter((item) => item.id !== 'welcome-message').concat(userMessage, assistantPlaceholder));
      setInputText('');
      setIsSending(true);
      setIsWaitingForResponse(true);

      let targetText = '';
      let displayedText = '';
      let streamComplete = false;
      let finishTyping!: () => void;
      const typingFinished = new Promise<void>((resolve) => {
        finishTyping = resolve;
      });

      const updateAssistantMessage = (nextText: string, finalType: 'chat' | 'itinerary' = 'chat', finalItineraryData?: Record<string, any>) => {
        setMessages((prev) => {
          const next = [...prev];
          let index = -1;

          for (let i = next.length - 1; i >= 0; i -= 1) {
            if (next[i].id === assistantId) {
              index = i;
              break;
            }
          }

          if (index === -1) {
            return prev;
          }

          next[index] = {
            ...next[index],
            text: nextText,
            timestamp: new Date(),
            type: finalType,
            itineraryData: finalItineraryData,
          };

          return next;
        });
      };

      typingIntervalRef.current = setInterval(() => {
        if (displayedText.length < targetText.length) {
          displayedText = targetText.slice(0, displayedText.length + 1);
          updateAssistantMessage(displayedText);
          return;
        }

        if (streamComplete) {
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
          finishTyping();
        }
      }, 24);

      try {
        const response = await aiChatService.sendMessageStream(trimmedText, (partialText, isComplete) => {
          if (partialText.trim()) {
            setIsWaitingForResponse(false);
          }
          targetText = partialText.startsWith(targetText)
            ? partialText
            : `${targetText}${partialText}`;
          if (isComplete) {
            streamComplete = true;
          }
        });

        const responseContent = response?.message?.content ?? '';
        const parsedResponse = parseItineraryPayload(responseContent);
        const finalItinerary = response?.message?.itineraryData ?? response?.message?.itinerary ?? parsedResponse.itineraryData;

        if (finalItinerary && typeof finalItinerary === 'object') {
          targetText = parsedResponse.text || 'Here is a draft itinerary for review.';
          updateAssistantMessage(targetText, 'itinerary', finalItinerary as Record<string, any>);
        } else {
          targetText = parsedResponse.text || responseContent;
        }
        streamComplete = true;
        await typingFinished;

        await incrementFreeMessageCount();
      } catch (error: any) {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
        updateAssistantMessage(
          `Sorry, I encountered an error: ${error?.message || 'Unknown error'}. Please try again.`,
        );
      } finally {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
        setIsWaitingForResponse(false);
        setIsSending(false);
      }
    },
    [incrementFreeMessageCount, maxMessages, session?.user?.isProUser, todayMessageCount, usageLimitsEnabled, validateMessage],
  );

  const clearChat = useCallback(async () => {
    try {
      await aiChatService.clearConversation();
    } catch (error) {
      console.error('Failed to clear chat:', error);
    } finally {
      setMessages([createWelcomeMessage()]);
      setInputText('');
      setInputError(null);
      setRateLimitError(null);
      setIsWaitingForResponse(false);
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      setIsSending(false);
    }
  }, []);

  return {
    messages,
    isSending,
    isWaitingForResponse,
    inputText,
    setInputText,
    inputError,
    rateLimitError,
    handleSendMessage,
    clearChat,
    refreshConversation: loadConversation,
  };
};