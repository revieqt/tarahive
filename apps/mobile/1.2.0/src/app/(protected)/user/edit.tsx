import { TText, TView, TIcon } from '@/components/ui/Themed';
import React, { useMemo, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSession } from '@/context/SessionContext';
import Button from '@/components/ui/Button';
import StickyScrollView from '@/components/ui/StickyScrollView';
import InputModal from '@/components/modals/InputModal';
import { useUpdateProfile } from '@/hooks/user/useUpdateProfile';
import BackButton from '@/components/common/BackButton';
import ProfileImage from '@/components/ui/ProfileImage';
import { LinearGradient } from 'expo-linear-gradient';
import { EditableProfileFields } from '@/types/userTypes';

export default function EditProfileSettingsScreen() {
  const { session } = useSession();
  const { updateProfile, chooseProfileImage, profileImageUri, isPending } = useUpdateProfile();
  const user = session?.user;

  const [modalVisible, setModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<null | { key: keyof EditableProfileFields; label: string; type: 'text' | 'contactNumber'; initialValue?: string; placeholder?: string }>(null);
  const [draftValues, setDraftValues] = useState<EditableProfileFields>({});
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const interestOptions = useMemo(() => [
    { id: 'travel', label: 'Travel' },
    { id: 'food', label: 'Food' },
    { id: 'music', label: 'Music' },
    { id: 'nature', label: 'Nature' },
    { id: 'photography', label: 'Photography' },
    { id: 'fitness', label: 'Fitness' },
    { id: 'reading', label: 'Reading' },
    { id: 'gaming', label: 'Gaming' },
    { id: 'art', label: 'Art' },
    { id: 'technology', label: 'Technology' },
    { id: 'fashion', label: 'Fashion' },
    { id: 'movies', label: 'Movies' },
  ], []);

  const fields = useMemo(() => [
    { key: 'username', label: 'Username', value: user?.username, type: 'text' as const, placeholder: 'Username' },
    { key: 'fname', label: 'First name', value: user?.fname, type: 'text' as const, placeholder: 'First name' },
    { key: 'lname', label: 'Last name', value: user?.lname, type: 'text' as const, placeholder: 'Last name' },
    { key: 'bio', label: 'Bio', value: user?.bio, type: 'text' as const, placeholder: 'Bio' },
    { key: 'interests', label: 'Interests', value: Array.isArray(user?.interests) ? user.interests : [], type: 'text' as const, placeholder: 'Interests' },
  ] satisfies Array<{
    key: keyof EditableProfileFields;
    label: string;
    value: string | string[] | undefined;
    type: 'text';
    placeholder: string;
  }>, [user?.username, user?.fname, user?.lname, user?.bio, user?.interests]);

  const openEditor = (field: typeof fields[number]) => {
    if (field.key === 'interests') {
      const currentInterests = Array.isArray(draftValues.interests)
        ? draftValues.interests
        : Array.isArray(user?.interests)
          ? user.interests
          : [];
      setSelectedInterests(currentInterests);
      setEditingField({
        key: field.key,
        label: field.label,
        type: 'text',
        initialValue: '',
        placeholder: field.placeholder,
      });
      setModalVisible(true);
      return;
    }

    const initialValue = Array.isArray(field.value) ? field.value.join(', ') : field.value || '';

    setEditingField({
      key: field.key,
      label: field.label,
      type: field.type,
      initialValue,
      placeholder: field.placeholder,
    });
    setModalVisible(true);
  };

  const handleModalSubmit = (value: string | { areaCode: string; number: string }) => {
    if (!editingField) return;

    if (editingField.key === 'interests') {
      setDraftValues(prev => ({ ...prev, interests: selectedInterests }));
      setModalVisible(false);
      setEditingField(null);
      return;
    } else if (typeof value === 'string') {
      setDraftValues(prev => ({ ...prev, [editingField.key]: value }));
    } else {
      setDraftValues(prev => ({ ...prev, [editingField.key]: `${value.areaCode}${value.number}` }));
    }

    setModalVisible(false);
    setEditingField(null);
  };

  const handleSave = () => {
    updateProfile(draftValues);
  };

  return (
    <>
      <StickyScrollView
        style={{ flex: 1, padding: '3%' }}
        contentContainerStyle={{ paddingBottom: 100 }}
        title="Edit Profile"
        subtitle="Update your personal information"
      >
        <BackButton/>

        <TouchableOpacity style={styles.profileImageContainer} onPress={chooseProfileImage}>
          <ProfileImage imagePath={profileImageUri || user?.profileImage} />

          <LinearGradient
            colors={['transparent', '#000']}
            style={styles.profileImageGradient}
          >
            <TIcon name='pencil' size={20} color='#fff'/>
          </LinearGradient>
        </TouchableOpacity>

        {fields.map((field, index) => {
          const displayValue = draftValues[field.key] ?? field.value ?? '';
          const displayText = Array.isArray(displayValue)
            ? displayValue.map((item) => interestOptions.find((interest) => interest.id === item)?.label || item).join(', ')
            : displayValue;

          return (
            <TView
              key={field.key}
              style={[
                styles.sectionContainer,
                index < fields.length - 1 && styles.sectionDivider,
              ]}
            >
              <View style={styles.fieldContent}>
                <TText style={styles.sectionChildDescription}>{field.label}</TText>
                <TText>{displayText ? displayText : 'N/A'}</TText>
              </View>
              <TouchableOpacity onPress={() => openEditor(field)}>
                <TIcon name='pencil' size={20} />
              </TouchableOpacity>
            </TView>
          );
        })}
      </StickyScrollView>

      <Button
        title="Save Changes"
        type='primary'
        onPress={handleSave}
        buttonStyle={styles.button}
        disabled={isPending}
      />

      {editingField?.key === 'interests' ? (
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => {
            setModalVisible(false);
            setEditingField(null);
          }}
        >
          <TView style={styles.modalContent}>
            <TouchableOpacity onPress={() => {
              setModalVisible(false);
              setEditingField(null);
            }}>
              <TIcon name="chevron-left" size={24} />
            </TouchableOpacity>
            <TText type='title'>{editingField.label}</TText>

            <View style={styles.interestList}>
              {interestOptions.map((interest) => {
                const isSelected = selectedInterests.includes(interest.id);
                return (
                  <TouchableOpacity
                    key={interest.id}
                    style={[styles.interestChip, isSelected && styles.interestChipSelected]}
                    onPress={() => {
                      setSelectedInterests((prev) =>
                        prev.includes(interest.id)
                          ? prev.filter((item) => item !== interest.id)
                          : [...prev, interest.id]
                      );
                    }}
                  >
                    <TText style={isSelected && styles.interestChipTextSelected}>{interest.label}</TText>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Button
              title="Save"
              type='primary'
              buttonStyle={styles.button}
              onPress={() => handleModalSubmit('')}
            />
          </TView>
        </Modal>
      ) : (
        <InputModal
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setEditingField(null);
          }}
          onSubmit={handleModalSubmit}
          label={editingField?.label || ''}
          type={editingField?.type || 'text'}
          initialValue={editingField?.initialValue || ''}
          placeholder={editingField?.placeholder || ''}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc4',
  },
  profileImageContainer: {
    width: 120,
    aspectRatio: 1,
    alignSelf: 'center',
    borderRadius: 1000,
    marginBottom: 16,
    overflow: 'hidden',
  },
  profileImageGradient:{
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    alignItems: 'center'
  },
  sectionChildDescription: {
    fontSize: 10,
    opacity: 0.7,
  },
  fieldContent: {
    flex: 1,
    marginRight: 12,
  },
  button:{
    position:'absolute',
    bottom: 16,
    left: '3%',
    right: '3%',
  },
  modalContent: {
    flex: 1,
    padding: '3%',
  },
  interestList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestChip: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#8e8e93',
  },
  interestChipSelected: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  interestChipTextSelected: {
    color: '#fff',
  }
});