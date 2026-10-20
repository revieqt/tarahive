import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useSession } from '@/context/SessionContext';
import { updateProfile } from '@/services/userService';
import { showError, showInfo } from '@/services/toast.service';
import { EditableProfileFields, ProfileImageUpload } from '@/types/userTypes';

interface UpdateProfileVariables {
  fields: EditableProfileFields;
  profileImage: ProfileImageUpload | null;
}

export const useUpdateProfile = () => {
  const { session, updateSession } = useSession();
  const [profileImage, setProfileImage] = useState<ProfileImageUpload | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ fields, profileImage: selectedImage }: UpdateProfileVariables) => {
      const currentUser = session?.user;
      if (!currentUser) {
        throw new Error('Your profile session is no longer available');
      }

      const changedFields = Object.entries(fields).reduce<EditableProfileFields>(
        (changed, [key, value]) => {
          if (value === undefined) return changed;

          const field = key as keyof EditableProfileFields;
          const currentValue = currentUser[field];
          if (JSON.stringify(currentValue) !== JSON.stringify(value)) {
            Object.assign(changed, { [field]: value });
          }
          return changed;
        },
        {},
      );

      if (Object.keys(changedFields).length === 0 && !selectedImage) {
        return {
          response: null,
          changedFields,
        };
      }

      const response = await updateProfile({
        ...changedFields,
        ...(selectedImage ? { profileImage: selectedImage } : {}),
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to update profile');
      }

      return { response, changedFields };
    },
    onSuccess: async ({ response, changedFields }) => {
      if (!response) {
        showInfo('No changes', 'Your profile is already up to date.');
        return;
      }

      try {
        if (!session?.user) {
          throw new Error('Your profile session is no longer available');
        }

        await updateSession({
          user: {
            ...session.user,
            ...changedFields,
            ...(response.data.profileImage
              ? { profileImage: response.data.profileImage }
              : {}),
          },
        });

        setProfileImage(null);
        showInfo('Success', response.message || 'Profile updated successfully');
      } catch (error) {
        showError(
          'Error',
          error instanceof Error ? error.message : 'Failed to update local session',
        );
      }
    },
    onError: (error) => {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update profile';
      showError('Error', errorMsg);
    },
  });

  const chooseProfileImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
        base64: true,
      });

      if (!result.canceled) {
        const image = result.assets[0];
        if (!image.base64) {
          showError('Error', 'Could not read the selected profile image');
          return;
        }

        setProfileImage({
          uri: image.uri,
          base64: image.base64,
        });
      }
    } catch (error) {
      showError(
        'Error',
        error instanceof Error ? error.message : 'Failed to choose a profile image',
      );
    }
  };

  return {
    updateProfile: (fields: EditableProfileFields) =>
      mutation.mutate({ fields, profileImage }),
    updateProfileAsync: (fields: EditableProfileFields) =>
      mutation.mutateAsync({ fields, profileImage }),
    chooseProfileImage,
    profileImageUri: profileImage?.uri,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    status: mutation.status,
    reset: mutation.reset,
  };
};
