import { useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessage, clearConversationHistory, type UnifiedAIResponse } from '../services/aiChatService';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'chat' | 'itinerary'; // Message type from backend
  itineraryData?: Record<string, any>; // Store itinerary data for display button
}

const MESSAGES_QUERY_KEY = ['aiChatMessages'];

export const useAiChat = () => {
  const queryClient = useQueryClient();
  
  const initialMessages: Message[] = [
    {
      id: '1',
      text: "Hello, I'm Tara! Your personal travel assistant! What would you like to explore today?",
      isUser: false,
      timestamp: new Date(),
      type: 'chat',
    },
  ];

  const { data: messages = initialMessages } = useQuery({
    queryKey: MESSAGES_QUERY_KEY,
    queryFn: () => initialMessages,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const { mutate: sendMessage_mutation, isPending: isSending } = useMutation({
    mutationFn: async (userMessage: string) => {
      // Add user message to chat
      const userMsg: Message = {
        id: Date.now().toString(),
        text: userMessage,
        isUser: true,
        timestamp: new Date(),
        type: 'chat',
      };
      
      queryClient.setQueryData(MESSAGES_QUERY_KEY, (prev: Message[] = []) => [
        ...prev,
        userMsg,
      ]);

      // Send to backend unified endpoint
      const response: UnifiedAIResponse = await sendMessage(userMessage);

      // Add AI response to chat
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        isUser: false,
        timestamp: new Date(),
        type: response.type,
        itineraryData: response.json, // Store JSON data if present (itinerary)
      };
      
      queryClient.setQueryData(MESSAGES_QUERY_KEY, (prev: Message[] = []) => [
        ...prev,
        aiMsg,
      ]);

      return response;
    },
    onError: (error) => {
      const errorMsg: Message = {
        id: Date.now().toString(),
        text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        isUser: false,
        timestamp: new Date(),
        type: 'chat',
      };
      queryClient.setQueryData(MESSAGES_QUERY_KEY, (prev: Message[] = []) => [
        ...prev,
        errorMsg,
      ]);
    },
  });

  const handleSendMessage = useCallback(
    (text: string) => {
      if (text.trim()) {
        sendMessage_mutation(text.trim());
      }
    },
    [sendMessage_mutation]
  );

  const clearChat = useCallback(async () => {
    try {
      // Call backend to clear conversation history
      await clearConversationHistory();
      // Clear local messages
      queryClient.setQueryData(MESSAGES_QUERY_KEY, initialMessages);
    } catch (error) {
      console.error('Failed to clear chat:', error);
      // Still clear local messages even if API call fails
      queryClient.setQueryData(MESSAGES_QUERY_KEY, initialMessages);
    }
  }, [queryClient]);

  return {
    messages,
    isSending,
    handleSendMessage,
    clearChat,
  };
};