import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInputContentSizeChangeEvent
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
import { TText, TIcon } from '@/shared/components/ui/Themed';
import OptionsPopup from './OptionsPopup';
import BackButton from '../common/BackButton';


//////////////////////////////
// ChatArea
//////////////////////////////
export const ChatArea: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <View style={styles.chatArea}>{children}<View style={{height: 50}}/></View>;
};

//////////////////////////////
// ChatHeader
//////////////////////////////
interface ChatHeaderProps {
  title: string;
  description?: string;
  hasBackButton?: boolean;
  onBackPress?: () => void;
  optionsValue?: React.ReactNode[];
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  description,
  hasBackButton = false,
  optionsValue,
}) => {
    const primaryColor = useThemeColor({}, 'primary');
  return (
    <View style={[styles.chatHeader, { backgroundColor: primaryColor }]}>
      {hasBackButton && (
        <BackButton/>
      )}
      <View style={{ flex: 1 }}>
        <TText type='subtitle'>{title}</TText>
        {description && <TText style={styles.chatHeaderDesc}>{description}</TText>}
      </View>
      {optionsValue && (
        <OptionsPopup
          options={optionsValue}
          style={{ padding: 5 }}
        >
          <TIcon name="dots-vertical" size={24} />
        </OptionsPopup>
      )}
    </View>
  );
};

//////////////////////////////
// ChatField
//////////////////////////////
interface ChatFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend?: () => void;
  placeholder?: string;
  maxHeight?: number;
  children?: React.ReactNode
}

export const ChatField: React.FC<ChatFieldProps> = ({
  value,
  onChangeText,
  onSend,
  placeholder = 'Type a message...',
  maxHeight = 120,
  children
}) => {
  const [inputHeight, setInputHeight] = useState(40);
  const primaryColor = useThemeColor({}, 'primary');
  const accentColor = useThemeColor({}, 'accent');
  const textColor = useThemeColor({}, 'text');
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
        <LinearGradient 
            colors={['transparent', primaryColor]}
            style={styles.chatFieldContainer}
        >
          {children && (children)}
          <View style={{flexDirection: 'row',alignItems: 'flex-end' }}>
            <TextInput
                style={[styles.textInput, { height: Math.min(inputHeight, maxHeight), backgroundColor: primaryColor, color: textColor }]}
                multiline
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                onContentSizeChange={(e: TextInputContentSizeChangeEvent) => {
                setInputHeight(e.nativeEvent.contentSize.height + 10);
                }}
            />
            {onSend && (
                <TouchableOpacity onPress={onSend} style={styles.sendButton} disabled={value.trim() === ''}>
                    <TIcon name="send" size={25} color={value.trim() === '' ? '#999' : accentColor} />
                </TouchableOpacity>
            )}
          </View>
            
        </LinearGradient>
      
    </KeyboardAvoidingView>
  );
};

//////////////////////////////
// ChatBubble
//////////////////////////////
interface ChatBubbleProps {
  message: string;
  isCurrentUser: boolean;
  name?: string;
  profileImage?: string | number;
  date?: string;
  profileLink?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isCurrentUser,
  name,
  profileImage,
  date,
  profileLink,
}) => {
  const router = useRouter();
  const [isPressed, setIsPressed] = useState(false);
  
  // Handle both URI strings and required images
  const imageSource =
    typeof profileImage === 'string'
      ? { uri: profileImage }
      : profileImage;
      
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');

  const handleProfileImagePress = () => {
    if (profileLink) {
      router.push(profileLink);
    }
  };

  return (
    <View style={styles.bubbleOuter}>
      {/* For other user - show profile image on left */}
      {!isCurrentUser && profileImage && (
        <TouchableOpacity 
          onPress={handleProfileImagePress}
          style={styles.profileImageContainer}
        >
          <Image source={imageSource} style={styles.profileImage} />
        </TouchableOpacity>
      )}

      {/* Message bubble container - aligned based on user */}
      <View
        style={[
          styles.bubbleInnerContainer,
          { alignItems: isCurrentUser ? 'flex-end' : 'flex-start' },
        ]}
      >
        {/* Message Bubble */}
        <TouchableOpacity
          onPress={() => setIsPressed(!isPressed)}
          style={styles.bubbleWrapper}
          activeOpacity={1}
        >
          <View
            style={[
              styles.bubble,
              isCurrentUser ? 
              { borderBottomRightRadius: 5, backgroundColor: secondaryColor } : 
              { borderBottomLeftRadius: 5, backgroundColor: primaryColor },
            ]}
          >
            {!isCurrentUser && name && (
              <TText style={styles.bubbleName}>{name}</TText>
            )}
            <TText>{message}</TText>
          </View>
        </TouchableOpacity>

        {/* Date shown when bubble is pressed */}
        {isPressed && date && (
          <Text style={[
            styles.bubbleDate,
            { textAlign: isCurrentUser ? 'right' : 'left' }
          ]}>
            {date}
          </Text>
        )}
      </View>
    </View>
  );
};

//////////////////////////////
// Styles
//////////////////////////////
const styles = StyleSheet.create({
  chatArea: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 8,
  },
  chatHeaderDesc: {
    opacity: 0.7,
  },
  chatFieldContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    paddingTop: 100
  },
  textInput: {
    flex: 1,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ccc4',
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: 'Inter'
  },
  sendButton: {
    marginLeft: 5,
    paddingHorizontal: 10,
    paddingTop: 15,
    alignItems: 'center',
    height: '100%',
  },
  bubbleOuter: {
    flexDirection: 'row',
    marginVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'flex-end',
    gap: 8,
  },
  bubbleInnerContainer: {
    flex: 1,
    marginVertical: 0,
  },
  bubbleWrapper: {
    maxWidth: '85%',
  },
  bubble: {
    padding: 10,
    borderRadius: 15,
  },
  bubbleName: {
    marginBottom: 5,
    fontSize: 12,
    opacity: 0.7,
  },
  bubbleDate: {
    fontSize: 10,
    color: '#999',
    marginTop: 3,
    paddingHorizontal: 5,
  },
  profileImageContainer: {
    justifyContent: 'flex-end',
  },
  profileImage: {
    width: 32,
    aspectRatio: 1,
    borderRadius: 50,
    backgroundColor: '#ccc',
  },
});