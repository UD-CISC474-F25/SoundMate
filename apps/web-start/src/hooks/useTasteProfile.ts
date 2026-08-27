import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../integrations/api';

export function useTasteProfile() {
  const [showTasteProfileModal, setShowTasteProfileModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { request } = useApiClient();
  const queryClient = useQueryClient();

  const openModal = () => setShowTasteProfileModal(true);
  const closeModal = () => setShowTasteProfileModal(false);

  const submitTasteProfile = async (data: { artists: Array<string>; genres: Array<string> }) => {
    setIsSubmitting(true);
    try {
      await request('/users/me/taste-profile', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['users', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['users', 'me', 'profile'] }),
      ]);

      closeModal();
      return { success: true };
    } catch (error) {
      console.error('Failed to save taste profile:', error);
      const message = error instanceof Error ? error.message : undefined;
      return { success: false, error: message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    showTasteProfileModal,
    openModal,
    closeModal,
    submitTasteProfile,
    isSubmitting,
  };
}
