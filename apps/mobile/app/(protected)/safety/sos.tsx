// import React, { useState, useRef, useEffect } from "react";
// import { View, StyleSheet, Dimensions, Text, Modal, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
// import TextField from '@/components/TextField';
// import { ThemedText } from '@/components/ThemedText';
// import { ThemedView } from '@/components/ThemedView';
// import { ThemedIcons } from '@/components/ThemedIcons';
// import Button from '@/components/Button';
// import SOSButton from "@/components/SOSButton";
// import { LinearGradient } from "expo-linear-gradient";
// import { useThemeColor } from "@/hooks/useThemeColor";
// import { useSession } from "@/context/SessionContext";
// import { updateStringUserData } from "@/services/userService";
// import { useSafety } from "@/hooks/useSafety";
// import { useDeviceInfo } from "@/hooks/useDeviceInfo";
// import { CustomAlert } from '@/components/Alert';
// import { openDocument } from "@/utils/documentUtils";
// import BackButton from "@/components/BackButton";
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { SafeAreaView } from "react-native-safe-area-context";
// import InputModal from '@/components/modals/InputModal';
// import * as Location from 'expo-location';

// const emergencyTypes = [
//   { id: 'medical', label: 'Medical Emergency', icon: 'medical-bag'},
//   { id: 'criminal', label: 'Criminal Activity', icon: 'shield-alert'},
//   { id: 'fire', label: 'Fire Emergency', icon: 'fire'},
//   { id: 'natural', label: 'Natural Disasters', icon: 'weather-hurricane'},
//   { id: 'utility', label: 'Utility Emergency', icon: 'flash-off'},
//   { id: 'road', label: 'Road Emergency', icon: 'car'},
//   { id: 'domestic', label: 'Domestic and Personal Safety', icon: 'home-alert'},
//   { id: 'animal', label: 'Animal-Related Emergency', icon: 'paw'},
//   { id: 'other', label: 'Other', icon: 'help-circle' },
// ];

// export default function SOSSection(){
//   const gradientColor = useThemeColor({}, 'primary');
//   const accentColor = useThemeColor({}, 'accent');
//   const { session, updateSession } = useSession();
//   const { handleEnableSOS, handleDisableSOS, isLoading } = useSafety();
//   const deviceInfo = useDeviceInfo();
  
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedEmergencyType, setSelectedEmergencyType] = useState<string>('');
//   const [message, setMessage] = useState('');
//   const [emergencyContactModalVisible, setEmergencyContactModalVisible] = useState(false);
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertTitle, setAlertTitle] = useState('');
//   const [showSOSInHome, setShowSOSInHome] = useState(false);
//   const [isLoadingContact, setIsLoadingContact] = useState(false);
  
//   const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const [isLongPressing, setIsLongPressing] = useState(false);
  
//   // Get SOS state from session
//   const isSOSActive = session?.user?.safetyState?.isInAnEmergency || false;
//   const backgroundColor = isSOSActive ? 'red' : 'rgb(0, 101, 248)';

//   // Load the setting when component mounts
//   useEffect(() => {
//     const loadSetting = async () => {
//       try {
//         const value = await AsyncStorage.getItem('showSOSInHome');
//         setShowSOSInHome(value === 'true');
//       } catch (error) {
//         console.error('Error loading SOS home setting:', error);
//       }
//     };
//     loadSetting();
//   }, []);

//   const handleLongPressStart = () => {
//     setIsLongPressing(true);
//     longPressTimer.current = setTimeout(() => {
//       if (isSOSActive) {
//         // Disable safety mode
//         handleDisableSafetyMode();
//       } else {
//         // Show modal to enable safety mode
//         setModalVisible(true);
//       }
//       setIsLongPressing(false);
//     }, 2000); // 2 seconds
//   };

//   const handleLongPressEnd = () => {
//     setIsLongPressing(false);
//     if (longPressTimer.current) {
//       clearTimeout(longPressTimer.current);
//       longPressTimer.current = null;
//     }
//   };

//   const handleUpdateEmergencyContact = async (value: string | { areaCode: string; number: string }) => {
//     if (typeof value !== 'string') {
//       setAlertTitle('Error');
//       setAlertMessage('Please provide a valid email address');
//       setAlertVisible(true);
//       return;
//     }

//     if (!session?.user?.id || !session?.accessToken) {
//       setAlertTitle('Error');
//       setAlertMessage('Session not found');
//       setAlertVisible(true);
//       return;
//     }

//     try {
//       setIsLoadingContact(true);
//       await updateStringUserData(
//         session.user.id,
//         'safetyState.emergencyContact',
//         value,
//         session.accessToken,
//         updateSession
//       );
//       setAlertTitle('Success');
//       setAlertMessage('Emergency contact email updated');
//       setAlertVisible(true);
//       setEmergencyContactModalVisible(false);
//     } catch (error) {
//       setAlertTitle('Error');
//       setAlertMessage(error instanceof Error ? error.message : 'Failed to update emergency contact');
//       setAlertVisible(true);
//     } finally {
//       setIsLoadingContact(false);
//     }
//   };

//   const handleEnableSafetyMode = async () => {
//     if (!selectedEmergencyType) {
//       setAlertTitle('Error');
//       setAlertMessage('Please select an emergency type');
//       setAlertVisible(true);
//       return;
//     }

//     try {
//       // Request location permission
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         setAlertTitle('Error');
//         setAlertMessage('Location permission is required to activate SOS');
//         setAlertVisible(true);
//         return;
//       }

//       // Get current location
//       const location = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.High,
//       });

//       const { latitude, longitude } = location.coords;

//       // Call SOS service with device info
//       await handleEnableSOS({
//         emergencyType: selectedEmergencyType,
//         message: message || undefined,
//         latitude,
//         longitude,
//         device: deviceInfo.isLoaded ? {
//           deviceId: deviceInfo.deviceId,
//           brand: deviceInfo.brand,
//           model: deviceInfo.model,
//           os: deviceInfo.os,
//           osVersion: deviceInfo.osVersion,
//           deviceType: deviceInfo.deviceType,
//           appVersion: deviceInfo.appVersion,
//         } : undefined,
//       });

//       setAlertTitle('SOS Activated');
//       setAlertMessage('Emergency alert has been sent');
//       setAlertVisible(true);

//       // Close modal and reset form
//       setModalVisible(false);
//       setSelectedEmergencyType('');
//       setMessage('');
//     } catch (error) {
//       setAlertTitle('Error');
//       setAlertMessage(error instanceof Error ? error.message : 'Failed to activate SOS');
//       setAlertVisible(true);
//     }
//   };

//   const handleDisableSafetyMode = async () => {
//     try {
//       await handleDisableSOS(deviceInfo.isLoaded ? {
//         deviceId: deviceInfo.deviceId,
//         brand: deviceInfo.brand,
//         model: deviceInfo.model,
//         os: deviceInfo.os,
//         osVersion: deviceInfo.osVersion,
//         deviceType: deviceInfo.deviceType,
//         appVersion: deviceInfo.appVersion,
//       } : undefined);
//       setAlertTitle('SOS Deactivated');
//       setAlertMessage('Emergency mode has been turned off');
//       setAlertVisible(true);
//     } catch (error) {
//       setAlertTitle('Error');
//       setAlertMessage(error instanceof Error ? error.message : 'Failed to deactivate SOS');
//       setAlertVisible(true);
//     }
//   };


//   return (
//     <>
//       <View style={[styles.container, {backgroundColor: backgroundColor}]}>
//         <BackButton type='floating' color='#fff'/>
//         <TouchableOpacity onPress={() => openDocument('manual-sos-mobileApp')} style={styles.manual}>
//           <ThemedIcons name='information' size={22} color='#fff'/>
//         </TouchableOpacity>
//         <View style={[styles.circle, {width: Dimensions.get('window').width+50}]}>
//           <View style={styles.titleContainer}>
//             {isSOSActive ? (
//               <>
//                 <ThemedText type='title' style={{color: '#fff', fontSize: 25}}>SOS in Progress!</ThemedText>
//                 <ThemedText style={{color: '#fff'}}>Safety Mode: On</ThemedText>
//               </>
//             ) : (
//               <>
//                 <ThemedText type='title' style={{color: '#fff', fontSize: 25}}>All Clear!</ThemedText>
//                 <ThemedText style={{color: '#fff'}}>Safety Mode: Off</ThemedText>
//               </>
//             )}
//           </View>
//           <View style={styles.circle}>
//             <View style={styles.circle}>
//               <SOSButton 
//                 state={isSOSActive ? 'active' : 'notActive'}
//                 onPressIn={handleLongPressStart}
//                 onPressOut={handleLongPressEnd}
//                 disabled={isLoading}
//               />
//             </View>
//           </View>
//           <View style={styles.subtitleContainer}>
//             <Text style={{fontSize: 20}}>☝️</Text>
//             {isLongPressing ? (
//               <ThemedText style={{color: '#fff'}}>Hold for {isSOSActive ? 'deactivation' : 'activation'}...</ThemedText>
//             ) : isSOSActive ? (
//               <ThemedText style={{color: '#fff'}}>Long-press to End SOS</ThemedText>
//             ) : (
//               <ThemedText style={{color: '#fff'}}>Long-press to Activate SOS</ThemedText>
//             )}
//           </View>
//         </View>
        
//         <LinearGradient
//           colors={['transparent', gradientColor]}
//           style={styles.bottomGradient}
//         >
//             <ThemedView style={styles.emergencyContact} color='primary'>
//                 <ThemedText>{session?.user?.safetyState?.emergencyContact || "Add a Emergency Contact Email"}</ThemedText>
//                 <ThemedText style={{fontSize: 12, opacity: .6}}>
//                     {session?.user?.safetyState?.emergencyContact ? 'Emergency Contact Email' : 'Recieves alerts when SOS is activated'}
//                 </ThemedText>
//                 <TouchableOpacity 
//                   style={styles.emergencyContactEdit}
//                   onPress={() => setEmergencyContactModalVisible(true)}
//                 >
//                     <ThemedIcons name='pencil' size={20}/>
//                 </TouchableOpacity>
//             </ThemedView>
//         </LinearGradient>

//         {/* Emergency Type Selection Modal */}
//         <Modal
//           animationType="slide"
//           transparent={true}
//           visible={modalVisible}
//           onRequestClose={() => setModalVisible(false)}
//         >
//           <SafeAreaView style={{flex: 1}}>
//           <TouchableOpacity 
//             style={styles.modalOverlay} 
//             onPress={() => setModalVisible(false)}
//             activeOpacity={1}
//           >
//             <KeyboardAvoidingView 
//               behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//               style={styles.keyboardAvoidingView}
//             >
//               <TouchableOpacity 
//                 style={styles.modalContent} 
//                 onPress={(e) => e.stopPropagation()}
//                 activeOpacity={1}
//               >
//               <ThemedView color='primary' style={styles.modalContentInner}>
//                 <ThemedText type="subtitle">Select Emergency Type</ThemedText>
//               <ScrollView style={styles.emergencyTypesList} showsVerticalScrollIndicator={false}>
//                 {emergencyTypes.map((type) => (
//                   <TouchableOpacity
//                     key={type.id}
//                     style={[
//                       styles.emergencyTypeButton,
//                       selectedEmergencyType === type.id && { backgroundColor: accentColor }
//                     ]}
//                     onPress={() => setSelectedEmergencyType(type.id)}
//                   >
//                     <ThemedIcons
//                       name={type.icon} 
//                       size={20} 
//                       color={selectedEmergencyType === type.id ? 'white' : undefined}
//                     />
//                     <ThemedText 
//                       style={[
//                         selectedEmergencyType === type.id && { color: 'white' }
//                       ]}
//                     >
//                       {type.label}
//                     </ThemedText>
//                   </TouchableOpacity>
//                 ))}
//               </ScrollView>

//               <View style={styles.messageSection}>
//                 <ThemedText>Additional Message (Optional)</ThemedText>
//                 <TextField
//                   placeholder="Describe your emergency situation..."
//                   value={message}
//                   onChangeText={setMessage}
//                   multiline={true}
//                   numberOfLines={3}
//                   style={styles.messageInput}
//                 />
//               </View>
//                 <Button
//                   title={isLoading ? 'Activating...' : 'Activate SOS'}
//                   onPress={handleEnableSafetyMode}
//                   disabled={!selectedEmergencyType || isLoading}
//                   type="primary"
//                   buttonStyle={{marginTop: 10}}
//                 />
//               </ThemedView>
//               </TouchableOpacity>
//             </KeyboardAvoidingView>
//           </TouchableOpacity>
//         </SafeAreaView>
//         </Modal>
//       </View>

//       <CustomAlert
//         visible={alertVisible}
//         title={alertTitle}
//         message={alertMessage}
//         icon={alertTitle === 'Success' ? 'check-circle' : 'alert'}
//         buttons={[
//           { text: 'OK', style: 'default', onPress: () => setAlertVisible(false) }
//         ]}
//         onClose={() => setAlertVisible(false)}
//         fadeAfter={3000}
//       />

//       <InputModal
//         visible={emergencyContactModalVisible}
//         onClose={() => setEmergencyContactModalVisible(false)}
//         onSubmit={handleUpdateEmergencyContact}
//         label="Emergency Contact Email"
//         description="Enter the email address of your emergency contact"
//         type="email"
//         placeholder="contact@example.com"
//         initialValue={session?.user?.safetyState?.emergencyContact || ''}
//       />
//     </>
    
//   );
// };

// const styles = StyleSheet.create({
//   container:{
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   circle:{
//     width: '100%',
//     aspectRatio: 1,
//     borderRadius: 1000,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 60,
//     backgroundColor: 'rgba(255,255,255,.3)'
//   },
//   titleContainer:{
//     position: 'absolute',
//     top: 30,
//     left: 0,
//     right: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: 3,
//   },
//   subtitleContainer:{
//     position: 'absolute',
//     bottom: 40,
//     left: 0,
//     right: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: 10,
//     opacity: .8
//   },
//   bottomGradient:{
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     padding: 16,
//     height: 150,
//     justifyContent: 'flex-end',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   keyboardAvoidingView: {
//     flex: 1,
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     width: '100%',
//     maxHeight: '80%',
//   },
//   modalContentInner: {
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     padding: 16,
//     paddingTop: 20,
//   },
//   emergencyTypesList: {
//     maxHeight: 300,
//     marginVertical: 20,
//   },
//   emergencyTypeButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 10,
//     marginBottom: 10,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#ccc4',
//     gap: 15
//   },
//   messageSection: {
//     marginBottom: 20,
//     gap: 10,
//   },
//   messageInput: {
//     minHeight: 80,
//   },
//   manual:{
//     position: 'absolute',
//     top: 16,
//     right: 16,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 8,
//   },
//   emergencyContact:{
//     padding: 10,
//     borderRadius: 12,
//   },
//   emergencyContactEdit:{
//     position: 'absolute',
//     top: 10,
//     right: 15,
//     bottom: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { TIcon, TText, TView } from "@/shared/components/ui/Themed";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useThemeColor } from "@/shared/hooks/useThemeColor";
import { showError } from "@/shared/services/toast.service";
import HiveBg from "@/shared/components/common/HiveBg";
import Header from "@/shared/components/common/Header";

export default function VisibilitySettingsScreen() {
  const { t } = useLanguage();

  return (
    <TView style={styles.container}>
      <HiveBg />
      <Header title={t("settings.visibility.title")} subtitle={t("settings.visibility.subtitle")} />

    </TView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  languageList: {
    flex: 1,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 15,
  },
  languageInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  flag: {
    fontSize: 20,
    marginRight: 12,
  },
  nativeName: {
    fontSize: 12,
    opacity: 0.5,
  },
  checkmark: {
    fontSize: 20,
    color: "#FFC94D",
    fontWeight: "bold",
  },
});