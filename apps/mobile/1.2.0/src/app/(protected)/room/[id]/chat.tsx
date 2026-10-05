import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ChatArea, ChatBubble, ChatField } from '@/components/ui/Chat';
import { TView } from '@/components/ui/Themed';

type Message = {
  id: number;
  message: string;
  isCurrentUser: boolean;
  name?: string;
  date: string;
};

export default function ChatRoomScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      name: 'Alex',
      message: 'Hey everyone! Excited for the trip.',
      isCurrentUser: false,
      date: '10:30 AM',
    },
    {
      id: 2,
      message: 'Me too! I will share the details here.',
      isCurrentUser: true,
      date: '10:32 AM',
    },
  ]);

  const sendMessage = () => {
    const message = input.trim();
    if (!message) return;

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: Date.now(),
        message,
        isCurrentUser: true,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInput('');
  };

  return (
    <TView style={styles.container}>
      <ChatArea>
        <ScrollView
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <ChatBubble key={message.id} {...message} />
          ))}
        </ScrollView>
      </ChatArea>

      <ChatField
        value={input}
        onChangeText={setInput}
        onSend={sendMessage}
        placeholder="Message the room..."
      />
    </TView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messages: {
    flexGrow: 1,
    paddingVertical: 10,
  },
});
