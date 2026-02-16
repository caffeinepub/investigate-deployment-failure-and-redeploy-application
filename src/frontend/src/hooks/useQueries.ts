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
  MonthlyListenerStats,
  ListenerStatsUpdate,
  VerificationStatus,
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
      queryClient.invalidateQueries({ queryKey: ['liveSongsForAnalysis'] });
      queryClient.invalidateQueries({ queryKey: ['myLiveSongsWithStats'] });
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

// Artist Profile Management
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
      queryClient.invalidateQueries({ queryKey: ['allArtistProfiles'] });
      toast.success('Artist profile created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create artist profile');
    },
  });
}

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
      queryClient.invalidateQueries({ queryKey: ['allArtistProfiles'] });
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
      queryClient.invalidateQueries({ queryKey: ['allArtistProfiles'] });
      toast.success('Artist profile deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete artist profile');
    },
  });
}

// Admin Artist Profile Management
export function useGetAllArtistProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<ArtistProfile[]>({
    queryKey: ['allArtistProfiles'],
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
      queryClient.invalidateQueries({ queryKey: ['allArtistProfiles'] });
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
      queryClient.invalidateQueries({ queryKey: ['allArtistProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['myArtistProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['artistVerified'] });
      toast.success('Artist profile deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete artist profile');
    },
  });
}

export function useGetAllArtistsWithUserIds() {
  const { actor, isFetching } = useActor();

  return useQuery<ArtistProfile[]>({
    queryKey: ['allArtistsWithUserIds'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllArtistProfilesForAdmin();
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
      toast.success('Invite code generated successfully!');
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

// Admin Management
export function useIsCurrentUserAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
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

// Verification Management
export function useApplyForVerification() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.applyForVerification();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verificationRequests'] });
      queryClient.invalidateQueries({ queryKey: ['verifiedArtistStatus'] });
      toast.success('Verification request submitted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit verification request');
    },
  });
}

export function useGetVerificationRequestsForAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['verificationRequests'],
    queryFn: async () => {
      if (!actor) return [];
      const requests = await actor.getVerificationRequests();
      const allProfiles = await actor.getAllArtistProfilesForAdmin();
      
      return requests.map((request) => {
        const profile = allProfiles.find((p) => p.owner.toString() === request.user.toString());
        return {
          ...request,
          fullName: profile?.fullName || 'Unknown User',
        };
      });
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateVerificationStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      verificationId,
      status,
      expiryExtensionDays,
    }: {
      verificationId: string;
      status: VerificationStatus;
      expiryExtensionDays: number;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateVerificationStatus(verificationId, status, BigInt(expiryExtensionDays));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verificationRequests'] });
      queryClient.invalidateQueries({ queryKey: ['artistVerified'] });
      toast.success('Verification status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update verification status');
    },
  });
}

export function useGetVerifiedArtistStatus() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['verifiedArtistStatus'],
    queryFn: async () => {
      if (!actor || !identity) return { isExpired: false, hasPendingRequest: false };
      
      const requests = await actor.getVerificationRequestsByUser(identity.getPrincipal());
      const hasPendingRequest = requests.some((r) => r.status === VerificationStatus.pending);
      
      const approvedRequest = requests.find((r) => r.status === VerificationStatus.approved);
      if (!approvedRequest || !approvedRequest.verificationApprovedTimestamp) {
        return { isExpired: false, hasPendingRequest };
      }

      const approvalTime = Number(approvedRequest.verificationApprovedTimestamp / BigInt(1000000));
      const expiryTime = approvalTime + (30 + Number(approvedRequest.expiryExtensionDays)) * 24 * 60 * 60 * 1000;
      const isExpired = Date.now() > expiryTime;

      return { isExpired, hasPendingRequest };
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

// New hook: Check if an artist (by owner Principal) is verified
export function useIsArtistVerified(ownerPrincipal: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['artistVerified', ownerPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !ownerPrincipal) return false;
      return actor.isArtistVerified(ownerPrincipal);
    },
    enabled: !!actor && !isFetching && !!ownerPrincipal,
  });
}

export function useAdminActivateVerifiedArtist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userPrincipal: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(userPrincipal);
      const requests = await actor.getVerificationRequestsByUser(principal);
      const pendingRequest = requests.find((r) => r.status === VerificationStatus.pending);
      
      if (!pendingRequest) {
        throw new Error('No pending verification request found');
      }

      await actor.updateVerificationStatus(pendingRequest.id, VerificationStatus.approved, BigInt(0));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verificationRequests'] });
      queryClient.invalidateQueries({ queryKey: ['artistVerified'] });
      toast.success('Artist verified and activated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to activate verified artist');
    },
  });
}

export function useAdminExtendVerifiedExpiry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userPrincipal, extensionDays }: { userPrincipal: string; extensionDays: number }) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(userPrincipal);
      const requests = await actor.getVerificationRequestsByUser(principal);
      const approvedRequest = requests.find((r) => r.status === VerificationStatus.approved);
      
      if (!approvedRequest) {
        throw new Error('No approved verification request found');
      }

      const currentExtension = Number(approvedRequest.expiryExtensionDays);
      const newExtension = currentExtension + extensionDays;

      await actor.updateVerificationStatus(approvedRequest.id, VerificationStatus.approved, BigInt(newExtension));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verificationRequests'] });
      queryClient.invalidateQueries({ queryKey: ['artistVerified'] });
      toast.success('Verification expiry extended successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to extend verification expiry');
    },
  });
}

export function useAdminUpdateVerificationRequestStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: string }) => {
      if (!actor) throw new Error('Actor not available');
      
      let verificationStatus: VerificationStatus;
      if (status === 'approved') {
        verificationStatus = VerificationStatus.approved;
      } else if (status === 'rejected') {
        verificationStatus = VerificationStatus.rejected;
      } else if (status === 'waiting') {
        verificationStatus = VerificationStatus.waiting;
      } else {
        verificationStatus = VerificationStatus.pending;
      }

      await actor.updateVerificationStatus(requestId, verificationStatus, BigInt(0));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verificationRequests'] });
      queryClient.invalidateQueries({ queryKey: ['artistVerified'] });
      toast.success('Verification status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update verification status');
    },
  });
}

// Monthly Listener Stats
export function useGetLiveSongsForAnalysis() {
  const { actor, isFetching } = useActor();

  return useQuery<SongSubmission[]>({
    queryKey: ['liveSongsForAnalysis'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLiveSongsForAnalysis();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSongMonthlyListenerStats() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (songId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSongMonthlyListenerStats(songId);
    },
  });
}

export function useUpdateMonthlyListenerStats() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ songId, updates }: { songId: string; updates: ListenerStatsUpdate[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMonthlyListenerStats(songId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveSongsForAnalysis'] });
      queryClient.invalidateQueries({ queryKey: ['myLiveSongsWithStats'] });
      toast.success('Monthly listener stats updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update monthly listener stats');
    },
  });
}

export function useGetMyLiveSongsWithStats() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['myLiveSongsWithStats'],
    queryFn: async () => {
      if (!actor) return [];
      
      const mySubmissions = await actor.getMySubmissions();
      const liveSongs = mySubmissions.filter((s) => s.status === SongStatus.live);
      
      const songsWithStats = await Promise.all(
        liveSongs.map(async (song) => {
          const stats = await actor.getSongMonthlyListenerStats(song.id);
          return { song, stats };
        })
      );
      
      return songsWithStats;
    },
    enabled: !!actor && !isFetching,
  });
}

// User Blocking
export function useIsUserBlocked() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isUserBlocked'],
    queryFn: async () => {
      if (!actor || !identity) return false;
      return actor.isUserBlocked(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
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
