import { TText, TView, TIcon } from '@/shared/components/ui/Themed';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet,TouchableOpacity,View, ScrollView, ActivityIndicator, Modal } from 'react-native';
// import { useSession } from '@/context/SessionContext';
import Switch from '@/shared/components/ui/Switch';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '@/shared/components/ui/Button';
import ProfileImage from '@/shared/components/ui/ProfileImage';
// import InputModal from '@/components/modals/InputModal';
// import { updateStringUserData, updateBooleanUserData, uploadProfileImage, updateUserLikes } from '@/services/userService';
// import { CustomAlert } from '@/components/Alert';
import * as ImagePicker from 'expo-image-picker';
// import ToggleButton from '@/components/ToggleButton';
// import { LIKES } from '@/shared/constants/Config';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
import Header from '@/shared/components/common/Header';
import HiveBg from '@/shared/components/common/HiveBg';

const Fields = [
  { label: 'Username', value: 'username', onPress: () => [] },
  { label: 'First Name', value: 'fname', onPress: () => [] },
  { label: 'Last Name', value: 'lname', onPress: () => [] },
  { label: 'Bio', value: 'bio', onPress: () => [] },
  { label: 'Contact Number', value: 'contactNumber', onPress: () => [] },
  { label: 'Interests', value: 'interests', onPress: () => [] },
];

export default function EditProfileSettingsScreen() {
//   const { session, updateSession } = useSession();
//   const user = session?.user;
  const primaryColor = useThemeColor({}, 'primary');
  const accentColor = useThemeColor({}, 'accent');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentField, setCurrentField] = useState<'fname' | 'lname' | 'bio' | 'contactNumber' | null>(null);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{ title: string; message: string; icon: string }>({ title: '', message: '', icon: 'information-circle-outline' });
  const [likesModalVisible, setLikesModalVisible] = useState(false);
//   const [selectedLikes, setSelectedLikes] = useState<string[]>(user?.likes || []);

//   const handleOpenModal = (field: 'fname' | 'lname' | 'bio' | 'contactNumber') => {
//     setCurrentField(field);
//     setModalVisible(true);
//   };

//   const handleStringUpdate = async (value: string | { areaCode: string; number: string }) => {
//     if (!currentField || !session?.accessToken || !user?.id) return;

//     try {
//       setLoading(true);
//       let fieldName = currentField;
//       let finalValue = value as string;

//       // Handle contact number format
//       if (currentField === 'contactNumber' && typeof value === 'object') {
//         finalValue = `${value.areaCode}${value.number}`;
//       }

//       // Capitalize first letter for fname and lname
//       if ((currentField === 'fname' || currentField === 'lname') && typeof finalValue === 'string') {
//         finalValue = finalValue.charAt(0).toUpperCase() + finalValue.slice(1);
//       }

//       const response = await updateStringUserData(user.id, fieldName, finalValue, session.accessToken, updateSession);

//       if (response.data) {
//         setAlertConfig({
//           title: 'Success',
//           message: `${currentField} updated successfully`,
//           icon: 'checkmark-circle-outline'
//         });
//         setAlertVisible(true);
//       }
//     } catch (error) {
//       setAlertConfig({
//         title: 'Error',
//         message: error instanceof Error ? error.message : 'Failed to update field',
//         icon: 'close-circle-outline'
//       });
//       setAlertVisible(true);
//     } finally {
//       setLoading(false);
//       setModalVisible(false);
//       setCurrentField(null);
//     }
//   };

//   const handleBooleanUpdate = async (fieldName: string, value: boolean) => {
//     if (!session?.accessToken || !user?.id) return;

//     try {
//       const response = await updateBooleanUserData(user.id, fieldName, value, session.accessToken, updateSession);

//       if (response.data) {
//         setAlertConfig({
//           title: 'Success',
//           message: 'Setting updated successfully',
//           icon: 'checkmark-circle-outline'
//         });
//         setAlertVisible(true);
//       }
//     } catch (error) {
//       setAlertConfig({
//         title: 'Error',
//         message: error instanceof Error ? error.message : 'Failed to update setting',
//         icon: 'close-circle-outline'
//       });
//       setAlertVisible(true);
//     }
//   };

//   const handleLikeToggle = (value: string, isSelected: boolean) => {
//     if (isSelected) {
//       setSelectedLikes(prev => [...prev, value]);
//     } else {
//       setSelectedLikes(prev => prev.filter(like => like !== value));
//     }
//   };

//   const handleSaveLikes = async () => {
//     if (!session?.accessToken) {
//       console.error('Missing access token');
//       return;
//     }

//     try {
//       setLoading(true);
      
//       // Update user likes without isFirstLoginValue
//       await updateUserLikes(
//         selectedLikes,
//         session.accessToken,
//         updateSession
//       );

//       setAlertConfig({
//         title: 'Success',
//         message: 'Likes updated successfully',
//         icon: 'checkmark-circle-outline'
//       });
//       setAlertVisible(true);
//       setLikesModalVisible(false);
//     } catch (error) {
//       setAlertConfig({
//         title: 'Error',
//         message: error instanceof Error ? error.message : 'Failed to update likes',
//         icon: 'close-circle-outline'
//       });
//       setAlertVisible(true);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleProfileImagePick = async () => {
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ['images'],
//         allowsEditing: true,
//         aspect: [3, 4],
//         quality: 0.7,
//       });

//       if (!result.canceled && result.assets[0] && session?.accessToken && user?.id) {
//         setLoading(true);
//         const imageUri = result.assets[0].uri;
//         const response = await uploadProfileImage(user.id, imageUri, session.accessToken, updateSession);

//         if (response.data) {
//           setAlertConfig({
//             title: 'Success',
//             message: 'Profile image updated successfully',
//             icon: 'checkmark-circle-outline'
//           });
//           setAlertVisible(true);
//         }
//       }
//     } catch (error) {
//       setAlertConfig({
//         title: 'Error',
//         message: error instanceof Error ? error.message : 'Failed to upload profile image',
//         icon: 'close-circle-outline'
//       });
//       setAlertVisible(true);
//     } finally {
//       setLoading(false);
//     }
//   };

  return (
    <TView style={{flex: 1}}>
      <HiveBg />
      <KeyboardAvoidingView
        style={{}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{padding: 16}}>
          <Header title="Edit Profile" subtitle="Update your personal information and settings" />
            
            <TouchableOpacity style={styles.profileImageContainer} onPress={() => {}} disabled={loading}>
              <ProfileImage/>
              <LinearGradient
                colors={['transparent', '#000']}
                style={styles.profileImageGradient}
              >
                {loading ? <ActivityIndicator size="small" color="white" /> : <TIcon name='pencil' size={20} color='white'/>}
              </LinearGradient>
            </TouchableOpacity>

            {Fields.map(field => (
              <TView key={field.value} style={styles.sectionContainer} color='primary'>
                <View>
                    <TText>{field.value}</TText>
                    <TText style={styles.sectionChildDescription}>{field.label}</TText>
                </View>
                <TouchableOpacity onPress={field.onPress} disabled={loading}>
                    <TIcon name='pencil' size={20} />
                </TouchableOpacity>
              </TView>
            ))}
            
        </ScrollView>
      </KeyboardAvoidingView>

    </TView>
  );
}

const styles = StyleSheet.create({
  sectionContainer:{
    borderRadius: 15,
    padding: 10,
    marginBottom: 8,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer:{
    width: '50%',
    aspectRatio: 1,
    alignSelf: 'center',
    borderRadius: 1000,
    marginVertical: 16,
    overflow: 'hidden',
  },
  profileImageGradient:{
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    height: '30%',
  },
  sectionTitle: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc4',
    paddingBottom: 5,
    fontSize: 14,
  },
  sectionChildDescription:{
    fontSize: 12,
    opacity: 0.7,
  },
});