import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiClient } from '../integrations/api';

export type Link = {
  id: string;
  userId: string;
  title: string;
  url: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export function useProfileLinks() {
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { request } = useApiClient();
  const queryClient = useQueryClient();

  const { data: links, isLoading } = useApiQuery<Link[]>(
    ['links'],
    '/links'
  );

  const openCreateModal = () => {
    setEditingLink(null);
    setShowLinksModal(true);
  };

  const openEditModal = (link: Link) => {
    setEditingLink(link);
    setShowLinksModal(true);
  };

  const closeModal = () => {
    setShowLinksModal(false);
    setEditingLink(null);
  };

  const submitLink = async (data: { title: string; url: string }) => {
    setIsSubmitting(true);
    try {
      if (editingLink) {
        await request(`/links/${editingLink.id}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        });
      } else {
        await request('/links', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['links'] });

      closeModal();
      return { success: true };
    } catch (error) {
      console.error('Failed to save link:', error);
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteLink = async (linkId: string) => {
    try {
      await request(`/links/${linkId}`, {
        method: 'DELETE',
      });

      await queryClient.invalidateQueries({ queryKey: ['links'] });

      return { success: true };
    } catch (error) {
      console.error('Failed to delete link:', error);
      return { success: false, error };
    }
  };

  return {
    links: links || [],
    isLoading,
    showLinksModal,
    editingLink,
    openCreateModal,
    openEditModal,
    closeModal,
    submitLink,
    deleteLink,
    isSubmitting,
  };
}
