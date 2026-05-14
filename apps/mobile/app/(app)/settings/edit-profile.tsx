// import { TText, TView, TIcon } from '@/components/ui/Themed';
// import React, { useState } from 'react';
// import { KeyboardAvoidingView, Platform, StyleSheet,TouchableOpacity,View, ScrollView, ActivityIndicator, Modal } from 'react-native';
// // import { useSession } from '@/context/SessionContext';
// import Switch from '@/components/ui/Switch';
// import { router } from 'expo-router';
// import { LinearGradient } from 'expo-linear-gradient';
// import Button from '@/components/ui/Button';
// import ProfileImage from '@/components/ui/ProfileImage';
// import InputModal from '@/components/modals/InputModal';
// // import { updateStringUserData, updateBooleanUserData, uploadProfileImage, updateUserLikes } from '@/services/userService';
// // import { CustomAlert } from '@/components/Alert';
// import * as ImagePicker from 'expo-image-picker';
// // import ToggleButton from '@/components/ToggleButton';
// // import { LIKES } from '@/shared/constants/Config';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useThemeColor } from '@/shared/hooks/useThemeColor';

// export default function EditProfileSettingsScreen() {
//   const { session, updateSession } = useSession();
//   const user = session?.user;
//   const primaryColor = useThemeColor({}, 'primary');
//   const accentColor = useThemeColor({}, 'accent');
//   const [modalVisible, setModalVisible] = useState(false);
//   const [currentField, setCurrentField] = useState<'fname' | 'lname' | 'bio' | 'contactNumber' | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertConfig, setAlertConfig] = useState<{ title: string; message: string; icon: string }>({ title: '', message: '', icon: 'information-circle-outline' });
//   const [likesModalVisible, setLikesModalVisible] = useState(false);
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

//   return (
//     <ThemedView style={{flex: 1}}>
//       <GradientBlobs/>
//       <KeyboardAvoidingView
//         style={{}}
//         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//       >
//         <ScrollView>
//           <View style={{padding: 16}}>
//             <BackButton />
//             <ThemedText type='title'>
//               Account Control
//             </ThemedText>
//             <ThemedText>
//               Manage your account and privacy settings.
//             </ThemedText>
//           </View>

//           <ThemedView color='primary' style={styles.sectionContainer}>
//             <TouchableOpacity style={styles.profileImageContainer} onPress={handleProfileImagePick} disabled={loading}>
//               <ProfileImage imagePath={user?.profileImage} />
//               <LinearGradient
//                 colors={['transparent', '#000']}
//                 style={styles.profileImageGradient}
//               >
//                 {loading ? (
//                   <ActivityIndicator size="small" color="white" />
//                 ) : (
//                   <ThemedIcons name='pencil' size={20} color='white'/>
//                 )}
//               </LinearGradient>
//             </TouchableOpacity>
//             <View style={styles.sectionChild}>
//               <View>
//                 <ThemedText>{user?.fname}</ThemedText>
//                 <ThemedText style={styles.sectionChildDescription}>First Name</ThemedText>
//               </View>
//               <TouchableOpacity onPress={() => handleOpenModal('fname')}>
//                 <ThemedIcons name='pencil' size={20} />
//               </TouchableOpacity>
//             </View>
//             <View style={styles.sectionChild}>
//               <View>
//                 <ThemedText>{user?.lname || 'N/A'}</ThemedText>
//                 <ThemedText style={styles.sectionChildDescription}>Last Name</ThemedText>
//               </View>
//               <TouchableOpacity onPress={() => handleOpenModal('lname')}>
//                 <ThemedIcons name='pencil' size={20} />
//               </TouchableOpacity>
//             </View>
//             <View style={styles.sectionChild}>
//               <View>
//                 <ThemedText>{user?.bio|| 'N/A'}</ThemedText>
//                 <ThemedText style={styles.sectionChildDescription}>Bio</ThemedText>
//               </View>
//               <TouchableOpacity onPress={() => handleOpenModal('bio')}>
//                 <ThemedIcons name='pencil' size={20} />
//               </TouchableOpacity>
//             </View>
//             <View style={styles.sectionChild}>
//               <View>
//                 <ThemedText>{user?.contactNumber || 'N/A'}</ThemedText>
//                 <ThemedText style={styles.sectionChildDescription}>Contact Number</ThemedText>
//               </View>
//               <TouchableOpacity onPress={() => handleOpenModal('contactNumber')}>
//                 <ThemedIcons name='pencil' size={20} />
//               </TouchableOpacity>
//             </View>
//             <View style={styles.sectionChild}>
//               <View>
//                 <ThemedText>{user?.likes && user.likes.length > 0 ? user.likes.join(', ') : 'N/A'}</ThemedText>
//                 <ThemedText style={styles.sectionChildDescription}>Likes</ThemedText>
//               </View>
//               <TouchableOpacity onPress={() => setLikesModalVisible(true)}>
//                 <ThemedIcons name='pencil' size={20} />
//               </TouchableOpacity>
//             </View>
//           </ThemedView>

//           <ThemedView color='primary' style={styles.sectionContainer}>
//             <ThemedText style={styles.sectionTitle}>
//               Security Settings
//             </ThemedText>
//             <TouchableOpacity style={styles.sectionChild} onPress={()=> router.push('/auth/changePassword')}>
//               <View>
//                 <ThemedText>Change Password</ThemedText>
//                 <ThemedText style={styles.sectionChildDescription}>Update Password Regularly</ThemedText>
//               </View>
//               <ThemedIcons name='chevron-right' size={20} />
//             </TouchableOpacity>
//             <Switch
//               key="2fa"
//               label="Two-Factor Authentication"
//               description="Email Verification on every login"
//               value={user?.securitySettings?.is2FAEnabled || false}
//               onValueChange={(value) => handleBooleanUpdate('securitySettings.is2FAEnabled', value)}
//             />
//           </ThemedView>

//           <ThemedView color='primary' style={styles.sectionContainer}>
//             <ThemedText style={styles.sectionTitle}>
//               Visibility Settings
//             </ThemedText>
//             <Switch
//               key="private"
//               label="Public Visibility"
//               description={user?.visibilitySettings?.isProfilePublic ? 'Public' : 'Private'}
//               value={user?.visibilitySettings?.isProfilePublic || false}
//               onValueChange={(value) => handleBooleanUpdate('visibilitySettings.isProfilePublic', value)}
//             />

//             <View style={!user?.visibilitySettings?.isProfilePublic && {opacity: 0.5, pointerEvents: 'none'}}>
//               <Switch
//               key="personal"
//               label="Show Personal Info"
//               description={user?.visibilitySettings?.isPersonalInfoPublic ? 'Public' : 'Hidden'}
//               value={user?.visibilitySettings?.isPersonalInfoPublic || false}
//               onValueChange={(value) => handleBooleanUpdate('visibilitySettings.isPersonalInfoPublic', value)}/>
//               <Switch
//               key="travel"
//               label="Show Travel Info"
//               description={user?.visibilitySettings?.isTravelInfoPublic ? 'Public' : 'Hidden'}
//               value={user?.visibilitySettings?.isTravelInfoPublic || false}
//               onValueChange={(value) => handleBooleanUpdate('visibilitySettings.isTravelInfoPublic', value)}
//               />
//             </View>
//           </ThemedView>
          
//           <ThemedView color='primary' style={styles.sectionContainer}>
            
//             <ThemedText style={styles.sectionTitle}>
//               Data Control
//             </ThemedText>
//             <TouchableOpacity style={styles.sectionChild} onPress={()=> router.push('/account/requestLogs')}>
//               <View>
//                 <ThemedText>Request Account Logs</ThemedText>
//                 <ThemedText style={styles.sectionChildDescription}>View your account activity and data</ThemedText>
//               </View>
//               <ThemedIcons name='chevron-right' size={20} />
//             </TouchableOpacity>
//           </ThemedView>
//         </ScrollView>
//       </KeyboardAvoidingView>

//       <InputModal
//         visible={modalVisible}
//         onClose={() => {
//           setModalVisible(false);
//           setCurrentField(null);
//         }}
//         onSubmit={handleStringUpdate}
//         type={currentField === 'contactNumber' ? 'contactNumber' : 'text'}
//         initialValue={
//           currentField === 'fname' ? user?.fname || '' :
//           currentField === 'lname' ? user?.lname || '' :
//           currentField === 'bio' ? user?.bio || '' :
//           currentField === 'contactNumber' ? user?.contactNumber || '' : ''
//         }
//         placeholder={
//           currentField === 'fname' ? 'John' :
//           currentField === 'lname' ? 'Doe' :
//           currentField === 'bio' ? 'My bio' :
//           currentField === 'contactNumber' ? '09123456789' : ''
//         }
//         description={
//           currentField === 'fname' ? 'Enter first name' :
//           currentField === 'lname' ? 'Enter last name' :
//           currentField === 'bio' ? 'Enter bio' :
//           currentField === 'contactNumber' ? 'Enter contact number' : ''
//         }
//         label={
//           currentField === 'fname' ? 'First Name' :
//           currentField === 'lname' ? 'Last Name' :
//           currentField === 'bio' ? 'Bio' :
//           currentField === 'contactNumber' ? 'Contact Number' : ''
//         }
//       />

//       <Modal
//         visible={likesModalVisible}
//         transparent={true}
//         animationType="slide"
//         onRequestClose={() => setLikesModalVisible(false)}
//       >
//         <SafeAreaView style={{ flex: 1, backgroundColor: primaryColor }} edges={['top', 'bottom']}>
//           <ThemedView style={{ flex: 1 }} color='primary'>
//             <View style={{ padding: 16 }}>
//               <TouchableOpacity onPress={() => setLikesModalVisible(false)}>
//                 <ThemedIcons name="arrow-left" size={22} />
//               </TouchableOpacity>
//               <ThemedText type='title' style={{ marginBottom: 10, marginTop: 10 }}>
//                 Update Interests
//               </ThemedText>
//               <ThemedText style={{ opacity: 0.9 }}>
//                 Select your interests to personalize your experience
//               </ThemedText>
//             </View>

//             <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
//               <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingVertical: 20 }}>
//                 {LIKES.map((interest) => (
//                   <ToggleButton
//                     key={interest}
//                     value={interest}
//                     label={interest}
//                     initialSelected={selectedLikes.includes(interest)}
//                     onToggle={handleLikeToggle}
//                     textStyle={{ fontSize: 12 }}
//                     buttonStyle={{ paddingVertical: 5, paddingHorizontal: 14, borderRadius: 50 }}
//                   />
//                 ))}
//               </View>
//             </ScrollView>
//             <Button
//               title={loading ? 'Saving...' : 'Save Interests'}
//               onPress={handleSaveLikes}
//               type="primary"
//               disabled={loading}
//               buttonStyle={{ marginHorizontal: 16, marginBottom: 80 }}
//             />
//             <Wave style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: .7 }} color={accentColor} height={70} />
//           </ThemedView>
//         </SafeAreaView>
        
//       </Modal>

//       <CustomAlert
//         visible={alertVisible}
//         title={alertConfig.title}
//         message={alertConfig.message}
//         onClose={() => setAlertVisible(false)}
//         fadeAfter={3000}
//       />
//     </ThemedView>
//   );
// }

// const styles = StyleSheet.create({
//   sectionContainer:{
//     padding: 16,
//     marginTop: 10,
//   },
//   profileImageContainer:{
//     width: '50%',
//     aspectRatio: 1,
//     alignSelf: 'center',
//     borderRadius: 1000,
//     marginVertical: 10,
//     overflow: 'hidden',
//   },
//   profileImageGradient:{
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     height: '30%',
//   },
//   sectionTitle: {
//     marginBottom: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc4',
//     paddingBottom: 5,
//     fontSize: 14,
//   },
//   sectionChild:{
//     flexDirection: 'row',
//     paddingBottom: 5,
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   sectionChildDescription:{
//     fontSize: 12,
//     opacity: 0.7,
//   },
//   deleteButton:{
//     marginTop: 10,
//     backgroundColor: '#ff4d4d',
//   },
// });