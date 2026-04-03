import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { ThemedIcons } from '../ThemedIcons';
import TextField from '../TextField';
import ContactNumberField from '../ContactNumberField';
import Button from '../Button';
import BackButton from '../BackButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import Wave from '../Wave';
import { useThemeColor } from '@/hooks/useThemeColor';

// Color palette for room colors - defined outside component to prevent recreation
const COLOR_PALETTE = [
  '#FF6B9D', '#C06C84', '#6C5B7B', '#355C7D',
  '#2A9D8F', '#264653', '#E76F51', '#F4A261',
  '#E9C46A', '#FF5733', '#00A9CE', '#FF6B6B',
  '#4ECDC4', '#44AF69', '#F7DC6F', '#BB8FCE',
];

interface InputModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (value: string | { areaCode: string; number: string }) => void;
  label: string;
  description?: string;
  type: 'text' | 'email' | 'contactNumber' | 'color';
  initialValue?: string;
  placeholder?: string;
}

const InputModal: React.FC<InputModalProps> = ({
  visible,
  onClose,
  onSubmit,
  label,
  description,
  type,
  initialValue = '',
  placeholder = ''
}) => {
  const [textValue, setTextValue] = useState(initialValue);
  const [areaCode, setAreaCode] = useState('63+');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedColor, setSelectedColor] = useState(initialValue || '#FF6B9D');
  const [error, setError] = useState('');
  const accentColor = useThemeColor({}, 'accent');

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setTextValue(initialValue);
      setSelectedColor(initialValue || '#FF6B9D');
      setContactNumber('');
      setAreaCode('63+');
      setError('');
    }
  }, [visible, initialValue]);

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = () => {
    setError('');
    
    if (type === 'text' || type === 'email') {
      if (!textValue.trim()) {
        setError('Please enter a value');
        return;
      }
      if (type === 'email' && !isValidEmail(textValue.trim())) {
        setError('Please enter a valid email address');
        return;
      }
      onSubmit(textValue.trim());
    } else if (type === 'contactNumber') {
      if (!contactNumber.trim()) {
        setError('Please enter a contact number');
        return;
      }
      onSubmit({ areaCode, number: contactNumber });
    } else if (type === 'color') {
      onSubmit(selectedColor);
    }
    
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ThemedView style={{flex: 1}} color='primary'>
        <View style={styles.content}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <ThemedIcons name="arrow-left" size={24} />
          </TouchableOpacity>
          <ThemedText type='title'>
            {label}
          </ThemedText>
          {description && (
            <ThemedText style={{opacity: .7, marginBottom: 10}}>
              {description}
            </ThemedText>
          )}
          <View>
            {type === 'text' || type === 'email' ? (
              <TextField
                placeholder={placeholder || `Enter ${label.toLowerCase()}`}
                value={textValue}
                onChangeText={setTextValue}
                autoCapitalize="none"
                keyboardType={type === 'email' ? 'email-address' : 'default'}
              />
            ) : type === 'color' ? (
              <View style={styles.colorPickerContainer}>
                <View style={styles.selectedColorDisplay}>
                  <View style={[styles.selectedColorBox, { backgroundColor: selectedColor }]} />
                  <ThemedText style={styles.selectedColorText}>{selectedColor}</ThemedText>
                </View>
                <FlatList
                  data={COLOR_PALETTE}
                  keyExtractor={(color) => color}
                  numColumns={4}
                  scrollEnabled={false}
                  columnWrapperStyle={styles.colorGridRow}
                  renderItem={({ item: color }) => (
                    <TouchableOpacity
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        selectedColor === color && styles.colorOptionSelected
                      ]}
                      onPress={() => setSelectedColor(color)}
                    >
                      {selectedColor === color && (
                        <ThemedIcons name="check" size={24} color="#fff" />
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            ) : (
              <ContactNumberField
                areaCode={areaCode}
                onAreaCodeChange={setAreaCode}
                number={contactNumber}
                onNumberChange={setContactNumber}
                placeholder={placeholder || "Contact Number"}
              />
            )}
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <ThemedIcons name="alert-circle" size={16} color="#ff6b6b" />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          )}

          <View style={styles.button}>
            <Button
              title="Continue"
              onPress={handleSubmit}
              type="primary"
            />
          </View>
        </View>
        <Wave style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: .7}} color={accentColor} height={70}/>
        </ThemedView>
      </SafeAreaView>
      
    </Modal>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16
  },
  closeButton: {
    zIndex: 1,
    marginBottom: 10,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ff6b6b',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    flex: 1,
  },
  button: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
  },
  colorPickerContainer: {
    gap: 15,
  },
  selectedColorDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  selectedColorBox: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  selectedColorText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  colorGridRow: {
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  colorOption: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#000',
    borderWidth: 3,
  },
});

export default InputModal;