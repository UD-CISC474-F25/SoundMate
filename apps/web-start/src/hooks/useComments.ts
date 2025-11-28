import { useApiQuery, useApiMutation } from "../integrations/api";

export interface EventComment {
  id: string;
  eventId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;

  user: {
    id: string;
    username: string;
    displayName: string | null;
    profilePhotoUrl: string | null;
  };
}

export function useComments(eventId: string | null) {

  const {
    data: comments = [],
    isLoading: commentsLoading,
    refetch: refetchComments,
  } = useApiQuery<EventComment[]>(
    ["comments", eventId],
    eventId ? `/events/${eventId}/comments` : ""
  );

  const addCommentMutation = useApiMutation({
    endpoint: (vars: { eventId: string; content: string }) => ({
      path: `/events/${vars.eventId}/comments`,
      method: "POST",
    }),
    invalidateKeys: [
      ["comments", eventId],
      ["events"], 
    ],
  });

  async function addComment(eventId: string, content: string) {
    await addCommentMutation.mutateAsync({
      eventId,
      content, 
    });
  }

  const updateCommentMutation = useApiMutation({
    endpoint: (vars: {
      eventId: string;
      commentId: string;
      content: string;
    }) => ({
      path: `/events/${vars.eventId}/comments/${vars.commentId}`,
      method: "PATCH",
    }),
    invalidateKeys: [
      ["comments", eventId],
      ["events"], 
    ],
  });

  async function updateComment(
    eventId: string,
    commentId: string,
    content: string
  ) {
    await updateCommentMutation.mutateAsync({
      eventId,
      commentId,
      content,
    });
  }

  const deleteCommentMutation = useApiMutation({
    endpoint: (vars: { eventId: string; commentId: string }) => ({
      path: `/events/${vars.eventId}/comments/${vars.commentId}`,
      method: "DELETE",
    }),
    invalidateKeys: [
      ["comments", eventId],
      ["events"], 
    ],
  });

  async function deleteComment(eventId: string, commentId: string) {
    await deleteCommentMutation.mutateAsync({
      eventId,
      commentId,
    });
  }

  return {
    comments,
    commentsLoading,
    refetchComments,

    addComment,
    updateComment,
    deleteComment,

    isAdding: addCommentMutation.isPending,
    isUpdating: updateCommentMutation.isPending,
    isDeleting: deleteCommentMutation.isPending,
  };
}
