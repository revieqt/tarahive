import { TText, TView, TIcon } from '@/shared/components/ui/Themed';
import React, { useMemo, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSession } from '@/features/auth/context/SessionContext';
import Button from '@/shared/components/ui/Button';
import Header from '@/shared/components/common/Header';
import StickyScrollView from '@/shared/components/ui/StickyScrollView';
import { useLanguage } from '@/shared/context/LanguageContext';
import InputModal from '@/shared/components/modals/InputModal';
import { useUpdateProfile } from '@/features/user/hooks/useUpdateProfile';

export default function EditProfileSettingsScreen() {
  const { session } = useSession();
  const { t } = useLanguage();
  const { updateProfile, isPending } = useUpdateProfile();
  const user = session?.user;

  const [modalVisible, setModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<null | { key: string; label: string; type: 'text' | 'contactNumber'; initialValue?: string; placeholder?: string }>(null);
  const [draftValues, setDraftValues] = useState<Record<string, string | string[] | undefined>>({});
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
    { key: 'username', label: t('users.fields.username'), value: user?.username, type: 'text' as const, placeholder: t('users.fields.username') },
    { key: 'fname', label: t('users.fields.fname'), value: user?.fname, type: 'text' as const, placeholder: t('users.fields.fname') },
    { key: 'lname', label: t('users.fields.lname'), value: user?.lname, type: 'text' as const, placeholder: t('users.fields.lname') },
    { key: 'bio', label: t('users.fields.bio'), value: user?.bio, type: 'text' as const, placeholder: t('users.fields.bio') },
    { key: 'contactNumber', label: t('users.fields.contact'), value: user?.contactNumber, type: 'contactNumber' as const, placeholder: t('users.fields.contact') },
    { key: 'interests', label: t('users.fields.interests'), value: Array.isArray(user?.interests) ? user.interests : [], type: 'text' as const, placeholder: t('users.fields.interests') },
  ], [user?.username, user?.fname, user?.lname, user?.bio, user?.contactNumber, user?.interests, t]);

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
    const payload = Object.entries(draftValues).reduce((acc, [key, value]) => {
      if (key === 'interests') {
        if (Array.isArray(value) && value.length > 0) {
          acc[key as keyof typeof acc] = value;
        }
        return acc;
      }

      if (typeof value === 'string' && value.trim() !== '') {
        acc[key as keyof typeof acc] = value;
      }
      return acc;
    }, {} as Record<string, string | string[]>);

    if (Object.keys(payload).length === 0) {
      return;
    }

    updateProfile(payload);
  };

  return (
    <>
      <StickyScrollView
        style={{ flex: 1, padding: '3%' }}
        contentContainerStyle={{ paddingBottom: 100 }}
        title={t('users.fields.edit_title')}
        subtitle={t('users.fields.edit_subtitle')}
      >
        <Header title={t('users.fields.edit_title')} subtitle={t('users.fields.edit_subtitle')} />

        {fields.map(field => {
          const displayValue = draftValues[field.key] ?? field.value ?? '';
          const displayText = Array.isArray(displayValue)
            ? displayValue.map((item) => interestOptions.find((interest) => interest.id === item)?.label || item).join(', ')
            : displayValue;

          return (
            <TView key={field.key} style={styles.sectionContainer} color='primary'>
              <View style={styles.fieldContent}>
                <TText style={styles.sectionChildDescription}>{field.label}</TText>
                <TText>{displayText ? displayText : t('common.common.na')}</TText>
              </View>
              <TouchableOpacity onPress={() => openEditor(field)}>
                <TIcon name='pencil' size={20} />
              </TouchableOpacity>
            </TView>
          );
        })}
      </StickyScrollView>

      <Button
        title={t('common.common.save')}
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
              title={t('common.common.save')}
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
    borderRadius: 15,
    padding: 10,
    marginBottom: 8,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
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