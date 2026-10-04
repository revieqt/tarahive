import React, { useEffect, useRef } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import { ChatArea, ChatHeader, ChatField, ChatBubble } from '@/components/ui/Chat';
import { useAiChat } from '@/hooks/tara/useAiChat';
import { TText, TView, TIcon } from '@/components/ui/Themed';
import { Markdown } from '@/components/ui/Markdown';
import BackButton from '@/components/common/BackButton';
import { AutoScrollView } from '@/components/ui/AutoScrollView';
import { TARA_AI_SUGGESTIONS_EN } from '@/constants/TaraSuggestions';
import { formatDateToString } from '@/utils/formatDateToString';

export default function AiChatScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const {
    messages,
    isSending,
    isWaitingForResponse,
    inputText,
    setInputText,
    inputError,
    rateLimitError,
    handleSendMessage,
    clearChat,
  } = useAiChat();

  const [isTtsEnabled, setIsTtsEnabled] = React.useState(false);
  const [dotCount, setDotCount] = React.useState(1);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
    if (!isSending) return;

    const interval = setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1);
    }, 500);

    return () => clearInterval(interval);
  }, [isSending]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    if (lastMessage && !lastMessage.isUser && isTtsEnabled && !isSending) {
      Speech.speak(lastMessage.text, {
        language: 'en',
        rate: 1,
      });
    }
  }, [isSending, isTtsEnabled, messages]);

  const hasUserMessages = messages.some((msg) => msg.isUser);

  const handleSend = async () => {
    if (!inputText.trim()) {
      return;
    }

    await handleSendMessage(inputText);
  };

  const handleSuggestionPress = (suggestion: string) => {
    setInputText(suggestion);
  };

  const handleClearChat = async () => {
    Speech.stop();
    await clearChat();
  };

  const headerOptions = [
    {
      label: 'Clear Chat',
      iconName: 'trash-can',
      iconColor: '#ef4444',
      onPress: handleClearChat,
    },
    {
      label: isTtsEnabled ? 'Disable Speech' : 'Enable Speech',
      iconName: isTtsEnabled ? 'volume-high' : 'volume-off',
      iconColor: '#fff',
      onPress: () => setIsTtsEnabled(!isTtsEnabled),
    },
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
              source={require('../../../../assets/images/icon.png')}
              style={{ width: 60, height: 60, marginBottom: 10 }}
            />
            <TText type='title'>Hello, I'm Tara!</TText>
            <TText style={{ textAlign: 'center', opacity: 0.7, marginTop: 10, paddingHorizontal: 16 }}>
              Your personal travel assistant! What would you like to explore today?
            </TText>

            <AutoScrollView horizontal speed={10000} style={styles.suggestionContainer}>
              {TARA_AI_SUGGESTIONS_EN.map((suggestion, index) => (
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
            {(rateLimitError || inputError) && (
              <TText style={{ color: '#ef4444', padding: 8, textAlign: 'center', marginBottom: 8 }}>
                {rateLimitError || inputError}
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
                  minute: '2-digit',
                });
                const isLastMessage = index === messages.length - 1;

                if (!msg.isUser) {
                  return (
                    <View
                      key={msg.id}
                      style={{
                        paddingVertical: 30,
                        alignItems: 'flex-start',
                        maxWidth: '95%',
                        marginBottom: isLastMessage ? 60 : 0,
                        gap: 8,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Markdown>{msg.text}</Markdown>
                      </View>

                      {msg.itineraryData && Object.keys(msg.itineraryData).length > 0 && (
                        <TouchableOpacity
                          style={styles.viewItineraryButton}
                          onPress={() => {
                            router.push({
                              pathname: '/itinerary/create',
                              params: { itineraryData: JSON.stringify(msg.itineraryData) },
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

              {isSending && isWaitingForResponse && (
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
            {(rateLimitError || inputError) && (
              <TText style={{ color: '#ef4444', padding: 8, textAlign: 'center', marginBottom: 8 }}>
                {rateLimitError || inputError}
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
    maxHeight: 100,
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