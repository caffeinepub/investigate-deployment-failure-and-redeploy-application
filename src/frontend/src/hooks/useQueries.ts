import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import {
  ArtistProfile,
  SaveArtistProfileInput,
  UserProfile,
  InviteCode,
  SongSubmission,
  SubmitSongInput,
  SongStatus,
} from '../backend';
import { toast } from 'sonner';

// Song Submission Management
export function useSubmitSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SubmitSongInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitSong(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['allSubmissionsForAdmin'] });
      toast.success('Song submitted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit song');
    },
  });
}

export function useGetMySubmissions() {
  const { actor, isFetching } = useActor();

  return useQuery<SongSubmission[]>({
    queryKey: ['mySubmissions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMySubmissions();
    },
    enabled: !!actor && !isFetching,
  });
}

// Admin Song Submission Management
export function useGetAllSubmissionsForAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<SongSubmission[]>({
    queryKey: ['allSubmissionsForAdmin'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSubmissionsForAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminUpdateSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      adminRemarks,
      adminComment,
    }: {
      id: string;
      status: SongStatus;
      adminRemarks: string;
      adminComment: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminUpdateSubmission(id, status, adminRemarks, adminComment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSubmissionsForAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['mySubmissions'] });
      toast.success('Submission updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update submission');
    },
  });
}

export function useAdminDeleteSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminDeleteSubmission(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSubmissionsForAdmin'] });
      toast.success('Submission deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete submission');
    },
  });
}

// Check if current user is admin
export function useIsCurrentUserAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCurrentUserAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// Multi-Artist Profile Management
export function useGetMyArtistProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<ArtistProfile[]>({
    queryKey: ['myArtistProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyArtistProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateArtistProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SaveArtistProfileInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createArtistProfile(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myArtistProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['allArtistProfilesForAdmin'] });
      toast.success('Artist profile created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create artist profile');
    },
  });
}

export function useUpdateArtistProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: SaveArtistProfileInput }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateArtistProfile(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myArtistProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['allArtistProfilesForAdmin'] });
      toast.success('Artist profile updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update artist profile');
    },
  });
}

export function useDeleteArtistProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteArtistProfile(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myArtistProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['allArtistProfilesForAdmin'] });
      toast.success('Artist profile deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete artist profile');
    },
  });
}

// Admin Multi-Artist Profile Management
export function useGetAllArtistProfilesForAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<ArtistProfile[]>({
    queryKey: ['allArtistProfilesForAdmin'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllArtistProfilesForAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminEditArtistProfileById() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: SaveArtistProfileInput }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminEditArtistProfile(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allArtistProfilesForAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['myArtistProfiles'] });
      toast.success('Artist profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update artist profile');
    },
  });
}

export function useAdminDeleteArtistProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminDeleteArtistProfile(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allArtistProfilesForAdmin'] });
      toast.success('Artist profile deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete artist profile');
    },
  });
}

// User Profile
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save profile');
    },
  });
}

// Artist Profile Editing Access
export function useGetArtistProfileEditingAccessStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['artistProfileEditingAccessStatus'],
    queryFn: async () => {
      if (!actor) return true;
      return actor.getArtistProfileEditingAccessStatus();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetArtistProfileEditingAccess() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setArtistProfileEditingAccess(enabled);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artistProfileEditingAccessStatus'] });
      toast.success('Artist profile editing access updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update editing access');
    },
  });
}

// Invite Links
export function useGenerateInviteCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.generateInviteCode();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inviteCodes'] });
      toast.success('Invite code generated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate invite code');
    },
  });
}

export function useGetInviteCodes() {
  const { actor, isFetching } = useActor();

  return useQuery<InviteCode[]>({
    queryKey: ['inviteCodes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getInviteCodes();
    },
    enabled: !!actor && !isFetching,
  });
}
