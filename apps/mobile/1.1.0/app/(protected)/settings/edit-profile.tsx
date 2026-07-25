import { TText, TView, TIcon } from '@/shared/components/ui/Themed';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { useSession } from '@/features/auth/context/SessionContext';
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
import StickyScrollView from '@/shared/components/ui/StickyScrollView';
import BackButton from '@/shared/components/common/BackButton';
import { useLanguage } from '@/shared/context/LanguageContext';





export default function EditProfileSettingsScreen() {
  const { session, updateSession } = useSession();
  const { t } = useLanguage();
  const user = session?.user;
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const accentColor = useThemeColor({}, 'accent');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentField, setCurrentField] = useState<'fname' | 'lname' | 'bio' | 'contactNumber' | null>(null);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{ title: string; message: string; icon: string }>({ title: '', message: '', icon: 'information-circle-outline' });
  const [likesModalVisible, setLikesModalVisible] = useState(false);

  const Fields = [
    { label: t("users.fields.username"), value: user?.username, onPress: () => [] },
    { label: t("users.fields.fname"), value: user?.fname, onPress: () => [] },
    { label: t("users.fields.lname"), value: user?.lname, onPress: () => [] },
    { label: t("users.fields.bio"), value: user?.bio, onPress: () => [] },
    { label: t("users.fields.contact"), value: user?.contactNumber, onPress: () => [] },
    { label: t("users.fields.interests"), value: 'interests', onPress: () => [] },
  ];
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
    <>
      <StickyScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ height: 2000 }}
        headerAppearOn={200}
        title='Edit Profile'
        subtitle={'@' + user?.username}
      >
        <LinearGradient style={styles.headerBackground} colors={[accentColor, secondaryColor]}>
          <BackButton type='floating' color='white' />


          <HiveBg fade={false} />
          <HiveBg fade={false} flipHorizontal />
          <TView style={styles.headerBottom} />
        </LinearGradient>

        <TView>
          <TouchableOpacity style={styles.profileImageContainer} onPress={() => []} disabled={loading}>
            <ProfileImage imagePath={user?.profileImage} />
            <LinearGradient
              colors={['transparent', '#000']}
              style={styles.profileImageGradient}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <TIcon name='pencil' size={20} color='white' />
              )}
            </LinearGradient>
          </TouchableOpacity>

          {Fields.map(field => (
            <TView key={field.value} style={styles.sectionContainer} color='primary'>
              <View>
                <TText style={styles.sectionChildDescription}>{field.label}</TText>
                <TText>{field.value ? field.value : t("common.common.na")}</TText>
              </View>
              <TouchableOpacity onPress={field.onPress} disabled={loading}>
                <TIcon name='pencil' size={20} />
              </TouchableOpacity>
            </TView>
          ))}
        </TView>
      </StickyScrollView>

      <Button
        title={t("common.common.save")}
        type='primary'
        onPress={() => []}
        buttonStyle={styles.button}
      />
    </>
  )
}

const styles = StyleSheet.create({
  sectionContainer: {
    borderRadius: 15,
    padding: 10,
    marginBottom: 8,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: '3%'
  },
  profileImageContainer: {
    width: 120,
    aspectRatio: 1,
    alignSelf: 'center',
    borderRadius: 1000,
    marginVertical: 16,
    overflow: 'hidden',
    marginTop: -85,
  },
  profileImageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    height: '30%',
  },
  sectionChildDescription: {
    fontSize: 10,
    opacity: 0.7,
  },
  headerBackground: {
    width: '100%',
    height: 150,
    overflow: 'hidden',
  },
  headerBottom: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 200,
  },
  button:{
    position:'absolute',
    bottom: 16,
    left: '3%',
    right: '3%',
  }
});