import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import {
  ArtistProfile,
  SaveArtistProfileInput,
  UserProfile,
  InviteCode,
  SongSubmission,
  SongSubmissionInput,
  SongSubmissionEditInput,
  SongStatus,
  PodcastShow,
  PodcastShowInput,
  PodcastEpisode,
  PodcastEpisodeInput,
  PodcastCategory,
} from '../backend';
import { toast } from 'sonner';
import { useInternetIdentity } from './useInternetIdentity';
import { Principal } from '@dfinity/principal';

// Song Submission Management
export function useSubmitSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SongSubmissionInput) => {
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

export function useEditSongSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SongSubmissionEditInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editSongSubmission(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySubmissions'] });
      toast.success('Submission updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update submission');
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

export function useAdminSetSubmissionLive() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      liveUrl,
      adminRemarks,
      adminComment,
    }: {
      id: string;
      liveUrl: string;
      adminRemarks: string;
      adminComment: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminSetSubmissionLive(id, liveUrl, adminRemarks, adminComment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSubmissionsForAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['mySubmissions'] });
      toast.success('Submission set to live successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to set submission live');
    },
  });
}

export function useAdminEditSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SongSubmissionEditInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminEditSubmission(input);
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
      queryClient.invalidateQueries({ queryKey: ['mySubmissions'] });
      toast.success('Submission deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete submission');
    },
  });
}

// Podcast Show Management
export function useCreatePodcastShow() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PodcastShowInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPodcastShow(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPodcastShows'] });
      queryClient.invalidateQueries({ queryKey: ['allPodcasts'] });
      toast.success('Podcast show created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create podcast show');
    },
  });
}

export function useGetMyPodcastShows() {
  const { actor, isFetching } = useActor();

  return useQuery<PodcastShow[]>({
    queryKey: ['myPodcastShows'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyPodcastShows();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllPodcasts() {
  const { actor, isFetching } = useActor();

  return useQuery<PodcastShow[]>({
    queryKey: ['allPodcasts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPodcasts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApprovePodcast() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approvePodcast(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPodcasts'] });
      queryClient.invalidateQueries({ queryKey: ['myPodcastShows'] });
      toast.success('Podcast show approved successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve podcast show');
    },
  });
}

export function useRejectPodcast() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rejectPodcast(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPodcasts'] });
      queryClient.invalidateQueries({ queryKey: ['myPodcastShows'] });
      toast.success('Podcast show rejected');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject podcast show');
    },
  });
}

export function useMarkPodcastLive() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, liveLink }: { id: string; liveLink: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markPodcastLive(id, liveLink);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPodcasts'] });
      queryClient.invalidateQueries({ queryKey: ['myPodcastShows'] });
      toast.success('Podcast show marked as live');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to mark podcast show as live');
    },
  });
}

// Podcast Episode Management
export function useCreatePodcastEpisode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PodcastEpisodeInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPodcastEpisode(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myEpisodes'] });
      queryClient.invalidateQueries({ queryKey: ['allEpisodes'] });
      toast.success('Episode created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create episode');
    },
  });
}

export function useGetMyEpisodes() {
  const { actor, isFetching } = useActor();

  return useMutation({
    mutationFn: async (showId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMyEpisodes(showId);
    },
  });
}

export function useGetAllEpisodes() {
  const { actor, isFetching } = useActor();

  return useQuery<PodcastEpisode[]>({
    queryKey: ['allEpisodes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEpisodes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApproveEpisode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveEpisode(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allEpisodes'] });
      queryClient.invalidateQueries({ queryKey: ['myEpisodes'] });
      toast.success('Episode approved successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve episode');
    },
  });
}

export function useRejectEpisode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rejectEpisode(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allEpisodes'] });
      queryClient.invalidateQueries({ queryKey: ['myEpisodes'] });
      toast.success('Episode rejected');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject episode');
    },
  });
}

export function useMarkEpisodeLive() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markEpisodeLive(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allEpisodes'] });
      queryClient.invalidateQueries({ queryKey: ['myEpisodes'] });
      toast.success('Episode marked as live');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to mark episode as live');
    },
  });
}

// Invite Links Management
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
      toast.success('Invite code generated successfully');
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

// User blocking
export function useIsUserBlocked() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isUserBlocked', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return false;
      return actor.isUserBlocked(identity.getPrincipal());
    },
    enabled: !!actor && !!identity && !isFetching,
  });
}

export function useBlockUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userPrincipal: string) => {
      if (!actor) throw new Error('Actor not available');
      const { Principal } = await import('@dfinity/principal');
      return actor.blockUser(Principal.fromText(userPrincipal));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBlockedUsers'] });
      toast.success('User blocked successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to block user');
    },
  });
}

export function useUnblockUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userPrincipal: string) => {
      if (!actor) throw new Error('Actor not available');
      const { Principal } = await import('@dfinity/principal');
      return actor.unblockUser(Principal.fromText(userPrincipal));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBlockedUsers'] });
      toast.success('User unblocked successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to unblock user');
    },
  });
}

export function useGetAllBlockedUsers() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['allBlockedUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBlockedUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

// Team member management
export function useUpgradeUserToTeamMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userPrincipal: string) => {
      if (!actor) throw new Error('Actor not available');
      const { Principal } = await import('@dfinity/principal');
      return actor.upgradeUserToTeamMember(Principal.fromText(userPrincipal));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTeamMembers'] });
      toast.success('User upgraded to team member');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upgrade user');
    },
  });
}

export function useDowngradeTeamMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userPrincipal: string) => {
      if (!actor) throw new Error('Actor not available');
      const { Principal } = await import('@dfinity/principal');
      return actor.downgradeTeamMember(Principal.fromText(userPrincipal));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTeamMembers'] });
      toast.success('Team member downgraded');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to downgrade team member');
    },
  });
}

export function useGetAllTeamMembers() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['allTeamMembers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTeamMembers();
    },
    enabled: !!actor && !isFetching,
  });
}

// Website logo management
export function useGetWebsiteLogo() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['websiteLogo'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getWebsiteLogo();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetWebsiteLogo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logo: any) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setWebsiteLogo(logo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websiteLogo'] });
      toast.success('Logo updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update logo');
    },
  });
}

export function useRemoveWebsiteLogo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeWebsiteLogo();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websiteLogo'] });
      toast.success('Logo removed successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove logo');
    },
  });
}

// Check if current user is admin
export function useIsCurrentUserAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  
  // Include principal in query key to avoid stale cached data across identity changes
  const principal = identity?.getPrincipal().toString() || 'anonymous';

  const query = useQuery<boolean>({
    queryKey: ['isCurrentUserAdmin', principal],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 0, // Always refetch to ensure fresh admin status
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
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

// Admin Artist Profile Management
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

export function useAdminEditArtistProfile() {
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
      queryClient.invalidateQueries({ queryKey: ['myArtistProfiles'] });
      toast.success('Artist profile deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete artist profile');
    },
  });
}

export function useGetAllArtistsWithUserIds() {
  const { actor, isFetching } = useActor();

  return useQuery<{ principal: Principal; profiles: ArtistProfile[] }[]>({
    queryKey: ['allArtistsWithUserIds'],
    queryFn: async () => {
      if (!actor) return [];
      const owners = await actor.getAllArtistProfileOwnersForAdmin();
      const results = await Promise.all(
        owners.map(async (owner) => {
          const profiles = await actor.getArtistProfilesByUserForAdmin(owner);
          return { principal: owner, profiles };
        })
      );
      return results;
    },
    enabled: !!actor && !isFetching,
  });
}

// User Profile Management
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

// Artist Profile Editing Access Control
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
      toast.success('Access control updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update access control');
    },
  });
}

// Verified Artist (Pro) Management - Backend missing APIs
// These hooks are placeholders until backend implements the verification request system

export interface VerifiedArtistStatus {
  isVerified: boolean;
  isExpired: boolean;
  expiryDate: bigint | null;
  hasPendingRequest: boolean;
}

export interface VerificationRequest {
  id: string;
  user: Principal;
  status: 'pending' | 'approved' | 'rejected' | 'waiting';
  timestamp: bigint;
  fullName: string;
  verificationApprovedTimestamp: bigint | null;
  expiryExtensionDays: number;
}

// User-facing verified artist status query
export function useGetVerifiedArtistStatus() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<VerifiedArtistStatus>({
    queryKey: ['verifiedArtistStatus', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) {
        return {
          isVerified: false,
          isExpired: false,
          expiryDate: null,
          hasPendingRequest: false,
        };
      }
      
      // Backend gap: Need getVerifiedArtistStatus() API
      // For now, return default non-verified state
      return {
        isVerified: false,
        isExpired: false,
        expiryDate: null,
        hasPendingRequest: false,
      };
    },
    enabled: !!actor && !!identity && !isFetching,
  });
}

// User applies for verification
export function useApplyForVerification() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // Backend gap: Need applyForVerification() API
      throw new Error('Verification application API not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verifiedArtistStatus'] });
      queryClient.invalidateQueries({ queryKey: ['verificationRequestsForAdmin'] });
      toast.success('Verification application submitted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit verification application');
    },
  });
}

// Admin queries all verification requests
export function useGetVerificationRequestsForAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<VerificationRequest[]>({
    queryKey: ['verificationRequestsForAdmin'],
    queryFn: async () => {
      if (!actor) return [];
      // Backend gap: Need getVerificationRequests() API
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

// Admin activates verified artist status
export function useAdminActivateVerifiedArtist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userPrincipal: string) => {
      if (!actor) throw new Error('Actor not available');
      // Backend gap: Need activateVerifiedArtist(principal) API
      throw new Error('Activate verified artist API not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verificationRequestsForAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['verifiedArtistStatus'] });
      queryClient.invalidateQueries({ queryKey: ['allSubmissionsForAdmin'] });
      toast.success('Verified artist status activated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to activate verified artist status');
    },
  });
}

// Admin extends expiry
export function useAdminExtendVerifiedExpiry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userPrincipal, extensionDays }: { userPrincipal: string; extensionDays: number }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend gap: Need extendVerifiedExpiry(principal, days) API
      throw new Error('Extend verified expiry API not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verificationRequestsForAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['verifiedArtistStatus'] });
      toast.success('Verified artist expiry extended successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to extend verified artist expiry');
    },
  });
}

// Admin updates verification request status
export function useAdminUpdateVerificationRequestStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: 'pending' | 'approved' | 'rejected' }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend gap: Need updateVerificationRequestStatus(requestId, status) API
      throw new Error('Update verification request status API not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verificationRequestsForAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['verifiedArtistStatus'] });
      toast.success('Verification request status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update verification request status');
    },
  });
}
