import React, { useState, useRef } from "react";
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from "react-native";
import TextField from '@/shared/components/ui/TextField';
import { TText, TIcon, TView } from '@/shared/components/ui/Themed';
import Button from '@/shared/components/ui/Button';
import SOSButton from "@/shared/components/common/SOSButton";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColor } from "@/shared/hooks/useThemeColor";
import { useSession } from "@/features/auth/context/SessionContext";
import BackButton from "@/shared/components/common/BackButton";
import { SafeAreaView } from "react-native-safe-area-context";
import HiveBg from "@/shared/components/common/HiveBg";

const emergencyTypes = [
  { id: 'medical', label: 'Medical Emergency', icon: 'medical-bag'},
  { id: 'criminal', label: 'Criminal Activity', icon: 'shield-alert'},
  { id: 'fire', label: 'Fire Emergency', icon: 'fire'},
  { id: 'natural', label: 'Natural Disasters', icon: 'weather-hurricane'},
  { id: 'utility', label: 'Utility Emergency', icon: 'flash-off'},
  { id: 'road', label: 'Road Emergency', icon: 'car'},
  { id: 'domestic', label: 'Domestic and Personal Safety', icon: 'home-alert'},
  { id: 'animal', label: 'Animal-Related Emergency', icon: 'paw'},
  { id: 'other', label: 'Other', icon: 'help-circle' },
];

export default function SOSSection(){
  const gradientColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const accentColor = useThemeColor({}, 'accent');
  const { session, updateSession } = useSession();
  // const { handleEnableSOS, handleDisableSOS, isLoading } = useSafety();
  // const deviceInfo = useDeviceInfo();
  
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEmergencyType, setSelectedEmergencyType] = useState<string>('');
  const [message, setMessage] = useState('');
  const [emergencyContactModalVisible, setEmergencyContactModalVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('');
  const [showSOSInHome, setShowSOSInHome] = useState(false);
  const [isLoadingContact, setIsLoadingContact] = useState(false);
  
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  const gradientColors = isSOSActive 
    ? (['#D53E0F', secondaryColor] as const)
    : ([accentColor, secondaryColor] as const);

  const handleLongPressStart = () => {
    setIsLongPressing(true);
    longPressTimer.current = setTimeout(() => {
      if (isSOSActive) {
        // Disable safety mode
        // handleDisableSafetyMode();
      } else {
        // Show modal to enable safety mode
        setModalVisible(true);
      }
      setIsLongPressing(false);
    }, 2000); // 2 seconds
  };

  const handleLongPressEnd = () => {
    setIsLongPressing(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };



  return (
    <>
      <BackButton type='floating' color='#fff'/>
      <LinearGradient colors={gradientColors} style={styles.background}>
        <HiveBg flipHorizontal/>
        <HiveBg/>
      </LinearGradient>
        <ScrollView>
          <View style={styles.headerContainer}>
            <View style={styles.titleContainer}>
              {isSOSActive ? (
                <>
                  <TText type='title' style={{color: '#fff'}}>SOS in Progress!</TText>
                  <TText type='subtitle' style={{color: '#fff'}}>SOS: On</TText>
                </>
              ) : (
                <>
                  <TText type='title' style={{color: '#fff'}}>All Clear!</TText>
                  <TText type='subtitle' style={{color: '#fff'}}>SOS: Off</TText>
                </>
              )}
            </View>

            <SOSButton 
              state={isSOSActive ? 'active' : 'notActive'}
              onPressIn={handleLongPressStart}
              onPressOut={handleLongPressEnd}
              disabled={false}
            />

            <View style={styles.titleContainer}>
              <TText type='subtitle'>☝️</TText>
              {isLongPressing ? (
                <TText style={{color: '#fff'}}>Hold for {isSOSActive ? 'deactivation' : 'activation'}...</TText>
              ) : isSOSActive ? (
                <TText style={{color: '#fff'}}>Long-press to End SOS</TText>
              ) : (
                <TText style={{color: '#fff'}}>Long-press to Activate SOS</TText>
              )}
            </View>
          </View>

          <TView style={styles.messageContainer}>

          </TView>
          
        </ScrollView>
        
      

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={{flex: 1}}>
        <TouchableOpacity 
          style={styles.modalOverlay} 
          onPress={() => setModalVisible(false)}
          activeOpacity={1}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <TouchableOpacity 
              style={styles.modalContent} 
              onPress={(e) => e.stopPropagation()}
              activeOpacity={1}
            >
            <TView color='primary' style={styles.modalContentInner}>
              <TIcon
                name='alert-octagon'
                size={50} 
                color={accentColor}
                style={{alignSelf: 'center'}}
              />
              <TText type="subtitle" style={{textAlign: 'center', marginVertical: 10}}>Select Emergency Type</TText>

              <ScrollView 
                horizontal 
                contentContainerStyle={{gap: 7}}
                style={{maxHeight: 95}}
                showsHorizontalScrollIndicator={false}>
                {emergencyTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.emergencyTypeButton,
                      selectedEmergencyType === type.id && { backgroundColor: accentColor+'50' }
                    ]}
                    onPress={() => setSelectedEmergencyType(type.id)}
                  >
                    <TIcon
                      name={type.icon} 
                      size={30} 
                    />
                    <TText style={[{ textAlign: 'center', fontSize: 10 }]}>
                      {type.label}
                    </TText>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TextField
              placeholder="Describe your emergency situation... (Optional)"
              value={message}
              onChangeText={setMessage}
              multiline={true}
              numberOfLines={3}
              style={styles.messageInput}
            />

              <Button
                title={'Activate SOS'}
                onPress={() => {}}
                disabled={false}
                type="primary"
                buttonStyle={{marginTop: 10}}
              />
            </TView>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </SafeAreaView>
      </Modal>
    </>
    
  );
};

const styles = StyleSheet.create({
  background:{
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContainer:{
    height: Dimensions.get('window').height - 100,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    backgroundColor: 'red',
  },
  messageContainer:{
    padding: 16,
    marginHorizontal: '3%',
    borderRadius: 12,
  },
  titleContainer:{
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  modalOverlay: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
  },
  modalContentInner: {
    borderRadius: 15,
    padding: 16,
    margin: '3%',
  },
  emergencyTypesList: {
    maxHeight: 300,
    marginVertical: 20,
  },
  emergencyTypeButton: {
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc4',
    gap: 10,
    width: 100,
    height: 90,
  },
  messageSection: {
    marginBottom: 20,
    gap: 10,
  },
  messageInput: {
    minHeight: 80,
    marginTop: 7,
  },
  manual:{
    position: 'absolute',
    top: 16,
    right: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  emergencyContact:{
    padding: 10,
    borderRadius: 12,
  },
  emergencyContactEdit:{
    position: 'absolute',
    top: 10,
    right: 15,
    bottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});