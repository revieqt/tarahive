import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Image, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { ChatArea, ChatHeader, ChatField, ChatBubble } from '@/shared/components/ui/Chat';
import { useAiChat } from '@/features/tara/hooks/useAiChat';
import { useSession } from '@/features/auth/context/SessionContext';
import { TText, TView, TIcon } from '@/shared/components/ui/Themed';
import { Markdown } from '@/shared/components/ui/Markdown';
import BackButton from '@/shared/components/common/BackButton';
import { AutoScrollView } from '@/shared/components/ui/AutoScrollView';
import { TARA_AI_SUGGESTIONS } from '@/shared/constants/Tara';
import { formatDateToString } from '@/shared/utils/formatDateToString';

export default function AiChatScreen() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const [dotCount, setDotCount] = useState(1);
  const [todayMessageCount, setTodayMessageCount] = useState(0);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const { messages, isSending, handleSendMessage, clearChat } = useAiChat();
  const { session } = useSession();
  const maxMessages = parseInt(process.env.EXPO_PUBLIC_MAX_FREE_AI_MESSAGES_PER_DAY || '5', 5);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
    const loadMessageCount = async () => {
      try {
        const today = new Date().toDateString();
        const lastDateKey = 'last_message_count_date';
        const countKey = 'message_count_today';
        const lastDate = await AsyncStorage.getItem(lastDateKey);

        if (lastDate && lastDate !== today) {
          await AsyncStorage.removeItem(countKey);
          await AsyncStorage.setItem(lastDateKey, today);
          setTodayMessageCount(0);
          return;
        }

        const count = await AsyncStorage.getItem(countKey);
        setTodayMessageCount(count ? parseInt(count, 10) : 0);

        if (!lastDate) {
          await AsyncStorage.setItem(lastDateKey, today);
        }
      } catch (error) {
        console.error('Failed to load message count:', error);
      }
    };
    loadMessageCount();
  }, []);

  useEffect(() => {
    if (!isSending) return;

    const interval = setInterval(() => {
      setDotCount(prev => (prev % 3) + 1);
    }, 500);

    return () => clearInterval(interval);
  }, [isSending]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage &&
      !lastMessage.isUser &&
      isTtsEnabled &&
      !isSending
    ) {
      Speech.speak(lastMessage.text, {
        language: 'en',
        rate: 1,
      });
    }
  }, [messages, isTtsEnabled, isSending]);

  useEffect(() => {
    const isProUser = session?.user?.isProUser;

    if (!isProUser && todayMessageCount >= maxMessages) {
      setRateLimitError(`You've reached your daily limit of ${maxMessages} messages. Upgrade to Pro for unlimited access.`);
    } else {
      setRateLimitError(null);
    }
  }, [session?.user?.isProUser, todayMessageCount]);

  const handleSend = () => {
    if (inputText.trim()) {
      const isProUser = session?.user?.isProUser;

      if (!isProUser && todayMessageCount >= maxMessages) {
        return;
      }

      handleSendMessage(inputText);
      setInputText('');

      if (!isProUser) {
        const newCount = todayMessageCount + 1;
        setTodayMessageCount(newCount);
        AsyncStorage.setItem('message_count_today', newCount.toString()).catch(error => {
          console.error('Failed to save message count:', error);
        });
      }
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setInputText(suggestion);
  };

  const hasUserMessages = messages.some(msg => msg.isUser);

  const handleClearChat = async () => {
    Speech.stop();
    await clearChat();
  };

  const headerOptions: React.ReactNode[] = [
    <TouchableOpacity
      key="clear-chat"
      style={{ flexDirection: 'row', alignItems: 'center' }}
      onPress={handleClearChat}
    >
      <TIcon name="trash-can" size={18} />
      <TText style={{ marginLeft: 10 }}>Clear Chat</TText>
    </TouchableOpacity>,
    <TouchableOpacity
      key="toggle-tts"
      style={{ flexDirection: 'row', alignItems: 'center' }}
      onPress={() => setIsTtsEnabled(!isTtsEnabled)}
    >
      <TIcon
        name={isTtsEnabled ? 'volume-high' : 'volume-off'}
        size={18}
      />
      <TText style={{ marginLeft: 10 }}>
        {isTtsEnabled ? 'Disable Speech' : 'Enable Speech'}
      </TText>
    </TouchableOpacity>,
  ];

  return (
    <TView style={{ height: '100%', width: '100%' }}>

      {!hasUserMessages ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'space-between' }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <BackButton type='floating' />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require('@/shared/assets/images/icon.png')}
              style={{ width: 60, height: 60, marginBottom: 10 }}
            />
            <TText type='title'>
              Hello, I'm Tara!
            </TText>
            <TText style={{ textAlign: 'center', opacity: 0.7, marginTop: 10, paddingHorizontal: 16 }}>
              Your personal travel assistant! What would you like to explore today?
            </TText>

            <AutoScrollView horizontal speed={10000} style={styles.suggestionContainer}>
              {TARA_AI_SUGGESTIONS.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionButton}
                  onPress={() => handleSuggestionPress(suggestion)}
                >
                  <TText style={styles.suggestionText}>{suggestion}</TText>
                </TouchableOpacity>
              ))}
            </AutoScrollView>
          </View>

          <ChatField
            value={inputText}
            onChangeText={setInputText}
            onSend={handleSend}
            placeholder="Ask Tara something..."
            maxHeight={120}
          >
            {rateLimitError && (
              <TText style={{ color: '#ef4444', padding: 8, textAlign: 'center', marginBottom: 8 }}>
                {rateLimitError}
              </TText>
            )}
          </ChatField>
        </KeyboardAvoidingView>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ChatHeader
            title="Tara"
            description="Your travel assistant"
            hasBackButton
            onBackPress={() => router.back()}
            optionsValue={headerOptions}
          />

          <ChatArea>
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={{ paddingVertical: 10, flexGrow: 1, paddingRight: 7, paddingLeft: 16 }}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((msg, index) => {
                const dateString = msg.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                });
                const isLastMessage = index === messages.length - 1;

                if (!msg.isUser) {
                  return (
                    <View key={msg.id} style={{ paddingVertical: 30, alignItems: 'flex-start', maxWidth: '95%', marginBottom: isLastMessage ? 60 : 0, gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Markdown>
                          {msg.text}
                        </Markdown>
                      </View>
                      {msg.itineraryData && msg.type === 'itinerary' && (
                        <TouchableOpacity
                          style={styles.viewItineraryButton}
                          onPress={() => {
                            router.push({
                              pathname: '/ai/ai-itinerary',
                              params: { itineraryData: JSON.stringify(msg.itineraryData) }
                            });
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <TText type='subtitle'>{msg.itineraryData?.title || 'View Itinerary'}</TText>
                            <TText style={{ opacity: 0.5 }}>
                              {msg.itineraryData?.startDate && msg.itineraryData?.endDate
                                ? `${formatDateToString(msg.itineraryData.startDate)} - ${formatDateToString(msg.itineraryData.endDate)}`
                                : ''}
                            </TText>
                          </View>
                          <TIcon name="chevron-right" size={20} color='#ccc7' style={{ marginLeft: 10 }} />
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                }

                return (
                  <View key={msg.id} style={isLastMessage ? { marginBottom: 100 } : undefined}>
                    <ChatBubble
                      message={msg.text}
                      isCurrentUser={msg.isUser}
                      name={msg.isUser ? 'You' : 'Tara'}
                      date={dateString}
                      profileImage={undefined}
                    />
                  </View>
                );
              })}
              {isSending && (
                <View style={{ paddingVertical: 30, padding: 10, opacity: 0.7 }}>
                  <TText>Thinking{'.'.repeat(dotCount)}</TText>
                </View>
              )}
            </ScrollView>
          </ChatArea>

          <ChatField
            value={inputText}
            onChangeText={setInputText}
            onSend={handleSend}
            placeholder="Ask Tara something..."
            maxHeight={120}
          >
            {rateLimitError && (
              <TText style={{ color: '#ef4444', padding: 8, textAlign: 'center', marginBottom: 8 }}>
                {rateLimitError}
              </TText>
            )}
          </ChatField>
        </KeyboardAvoidingView>
      )}
    </TView>
  );
}

const styles = StyleSheet.create({
  suggestionContainer: {
    maxHeight: 100
  },
  suggestionButton: {
    backgroundColor: '#00CAFF',
    borderRadius: 50,
    paddingVertical: 7,
    paddingHorizontal: 14,
    opacity: 0.8,
  },
  suggestionText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 13,
  },
  viewItineraryButton: {
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc7',
    backgroundColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    borderRadius: 8,
    marginVertical: 10,
    padding: 10,
    justifyContent: 'center',
  },
});