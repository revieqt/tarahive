import { useThemeColor } from '@/shared/hooks/useThemeColor';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { TIcon, TText } from './Themed';

interface Option {
  label: string;
  iconName: string;
  iconColor?: string;
  onPress?: () => void;
}

interface OptionsProps {
  options?: Option[];
  style?: ViewStyle | ViewStyle[];
  disabled?: boolean;
  children?: React.ReactNode;
}

const Options: React.FC<OptionsProps> = ({ options = [], style, children, disabled=false }) => {
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const primaryColor = useThemeColor({}, 'primary');

  const handleOpen = () => {
    setVisible(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  const handleOptionPress = (option: Option) => {
    option.onPress?.();
    handleClose();
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0], // Slide up from 100px below
  });

  return (
    <View>
      <TouchableOpacity onPress={handleOpen} style={[styles.optionsButton, style]} disabled={disabled}>
        {children ? children : <Text style={styles.buttonText}>Options</Text>}
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <Pressable style={styles.overlay} onPress={handleClose}>
            <Animated.View style={[styles.menu, { backgroundColor: primaryColor, transform: [{ translateY }] }]}>
              {options.map((option, index) => (
                <TouchableOpacity key={index} style={styles.menuItem} onPress={() => handleOptionPress(option)}>
                  <TIcon name={option.iconName} color={option.iconColor} size={20} />
                  <TText>{option.label}</TText>
                </TouchableOpacity>
              ))}
            </Animated.View>
          </Pressable>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  optionsButton: {
    padding: 0,
  },
  buttonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  menu: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 4,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    gap: 15,
    width: '100%',

  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  icon: {
    marginRight: 12,
  },
});

export default Options;