import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useApiMutation } from '../integrations/api';

export function useAccountDelete() {
  const { logout } = useAuth0();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const deleteAccountMutation = useApiMutation({
    path: '/users/me',
    method: 'DELETE',
  });

  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const confirmDelete = async () => {
    try {
      await deleteAccountMutation.mutateAsync({} as any);
      await logout({ logoutParams: { returnTo: window.location.origin } });
      return { success: true };
    } catch (error) {
      console.error('Failed to delete account:', error);
      return { success: false, error };
    }
  };

  return {
    showDeleteModal,
    isDeleting: deleteAccountMutation.isPending,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
  };
}
