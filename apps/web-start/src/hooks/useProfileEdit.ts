import { useState } from 'react';
import { useApiMutation } from '../integrations/api';

interface ProfileEditForm {
  displayName: string;
  bio: string;
  showSpotifyProfile: boolean;
}

interface UserProfile {
  displayName?: string | null;
  bio?: string | null;
  showSpotifyProfile?: boolean;
}

export function useProfileEdit(user: UserProfile | undefined, timeRange: string) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<ProfileEditForm>({
    displayName: '',
    bio: '',
    showSpotifyProfile: false,
  });

  const updateProfileMutation = useApiMutation({
    path: '/users/me',
    method: 'PATCH',
    invalidateKeys: [['users', 'me', 'profile', timeRange]],
  });

  const openEditModal = () => {
    setEditForm({
      displayName: user?.displayName || '',
      bio: user?.bio || '',
      showSpotifyProfile: user?.showSpotifyProfile || false,
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
  };

  const updateField = <K extends keyof ProfileEditForm>(
    field: K,
    value: ProfileEditForm[K]
  ) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitUpdate = async () => {
    try {
      await updateProfileMutation.mutateAsync(editForm as any);
      setShowEditModal(false);
      return { success: true };
    } catch (error) {
      console.error('Failed to update profile:', error);
      return { success: false, error };
    }
  };

  return {
    showEditModal,
    editForm,
    isUpdating: updateProfileMutation.isPending,
    openEditModal,
    closeEditModal,
    updateField,
    submitUpdate,
  };
}
