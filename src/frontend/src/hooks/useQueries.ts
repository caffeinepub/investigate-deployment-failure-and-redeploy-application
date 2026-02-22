import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type {
  SongSubmissionInput,
  SongSubmission,
  SongStatus,
  SaveArtistProfileInput,
  ArtistProfile,
  VerificationStatus,
  ListenerStatsUpdate,
  MonthlyListenerStats,
  UserCategory,
  PodcastShowInput,
  PodcastShow,
  PodcastEpisodeInput,
  PodcastEpisode,
  PodcastModerationStatus,
  SubscriptionPlan,
  VideoSubmissionInput,
  VideoSubmission,
  VideoSubmissionStatus,
  SongSubmissionEditInput,
  UserProfile,
  InviteCode,
  RSVP,
} from '../backend';
import { Principal } from '@dfinity/principal';

// ================================
// USER PROFILE MANAGEMENT
// ================================
export function useGetCallerUserProfile() {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ================================
// ADMIN/AUTH CHECKS
// ================================
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

// ================================
// SUBSCRIPTION PLANS
// ================================
export function useGetAllSubscriptionPlans() {
  const { actor, isFetching } = useActor();

  return useQuery<SubscriptionPlan[]>({
    queryKey: ['subscriptionPlans'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSubscriptionPlans();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateSubscriptionPlan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plan: SubscriptionPlan) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createSubscriptionPlan(plan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
    },
  });
}

export function useUpdateSubscriptionPlan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plan: SubscriptionPlan) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateSubscriptionPlan(plan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
    },
  });
}

export function useDeleteSubscriptionPlan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planName: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteSubscriptionPlan(planName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
    },
  });
}

// ================================
// VIDEO SUBMISSIONS
// ================================
export function useSubmitVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: VideoSubmissionInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitVideo(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userVideoSubmissions'] });
    },
  });
}

export function useGetUserVideoSubmissions() {
  const { actor, isFetching } = useActor();

  return useQuery<VideoSubmission[]>({
    queryKey: ['userVideoSubmissions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserVideoSubmissions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllVideoSubmissions() {
  const { actor, isFetching } = useActor();

  return useQuery<VideoSubmission[]>({
    queryKey: ['allVideoSubmissions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVideoSubmissions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateVideoStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      videoId,
      status,
      liveUrl,
    }: {
      videoId: string;
      status: VideoSubmissionStatus;
      liveUrl: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateVideoStatus(videoId, status, liveUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allVideoSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['userVideoSubmissions'] });
    },
  });
}

export function useUpdateVideoSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ input, videoId }: { input: VideoSubmissionInput; videoId: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateVideoSubmission(input, videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allVideoSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['userVideoSubmissions'] });
    },
  });
}

export function useDeleteVideoSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteVideoSubmission(videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allVideoSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['userVideoSubmissions'] });
    },
  });
}

export function useDownloadVideoFile() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.downloadVideoFile(videoId);
    },
  });
}

// ================================
// SONG SUBMISSIONS
// ================================
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

export function useGetAllSubmissionsForAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<SongSubmission[]>({
    queryKey: ['allSubmissions'],
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
      await actor.adminUpdateSubmission(id, status, adminRemarks, adminComment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['mySubmissions'] });
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
      await actor.adminSetSubmissionLive(id, liveUrl, adminRemarks, adminComment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['mySubmissions'] });
    },
  });
}

export function useEditSongSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SongSubmissionEditInput) => {
      if (!actor) throw new Error('Actor not available');
      await actor.editSongSubmission(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySubmissions'] });
    },
  });
}

export function useAdminEditSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SongSubmissionEditInput) => {
      if (!actor) throw new Error('Actor not available');
      await actor.adminEditSubmission(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['mySubmissions'] });
    },
  });
}

export function useAdminDeleteSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.adminDeleteSubmission(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
    },
  });
}

// ================================
// ARTIST PROFILES
// ================================
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
      await actor.updateArtistProfile(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myArtistProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['allArtistProfiles'] });
    },
  });
}

export function useDeleteArtistProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteArtistProfile(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myArtistProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['allArtistProfiles'] });
    },
  });
}

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
      await actor.adminEditArtistProfile(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allArtistProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['myArtistProfiles'] });
    },
  });
}

export function useAdminDeleteArtistProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.adminDeleteArtistProfile(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allArtistProfiles'] });
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

export function useGetArtistProfileEditingAccessStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['artistProfileEditingAccess'],
    queryFn: async () => {
      if (!actor) return true;
      return actor.getArtistProfileEditingAccessStatus();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsArtistVerified() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isArtistVerified', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return false;
      return actor.isArtistVerified(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

// ================================
// VERIFICATION
// ================================
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
      queryClient.invalidateQueries({ queryKey: ['isArtistVerified'] });
    },
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
      expiryExtensionDays: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateVerificationStatus(verificationId, status, expiryExtensionDays);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verificationRequests'] });
      queryClient.invalidateQueries({ queryKey: ['isArtistVerified'] });
    },
  });
}

export function useGetVerificationRequests() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['verificationRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVerificationRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

// ================================
// MONTHLY LISTENER STATS
// ================================
export function useUpdateMonthlyListenerStats() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ songId, updates }: { songId: string; updates: ListenerStatsUpdate[] }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateMonthlyListenerStats(songId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyListenerStats'] });
      queryClient.invalidateQueries({ queryKey: ['liveSongsWithStats'] });
    },
  });
}

export function useGetSongMonthlyListenerStats() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (songId: string): Promise<MonthlyListenerStats[]> => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSongMonthlyListenerStats(songId);
    },
  });
}

export function useGetMyLiveSongsWithStats() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['liveSongsWithStats', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const liveSongs = await actor.getLiveSongsForAnalysis();
      const userSongs = liveSongs.filter(
        (song) => song.submitter.toString() === identity.getPrincipal().toString()
      );

      const songsWithStats = await Promise.all(
        userSongs.map(async (song) => {
          const stats = await actor.getSongMonthlyListenerStats(song.id);
          return { song, stats };
        })
      );

      return songsWithStats;
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

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

// ================================
// USER MANAGEMENT
// ================================
export function useUpdateUserCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, category }: { userId: Principal; category: UserCategory }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateUserCategory(userId, category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allArtistProfiles'] });
    },
  });
}

export function useBlockUserSongSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.blockUserSongSubmission(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
    },
  });
}

export function useUnblockUserSongSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.unblockUserSongSubmission(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
    },
  });
}

export function useBlockUserPodcastSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.blockUserPodcastSubmission(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
    },
  });
}

export function useUnblockUserPodcastSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.unblockUserPodcastSubmission(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
    },
  });
}

export function useIsCurrentUserBlockedSongSubmission() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isCurrentUserBlockedSongSubmission', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return false;
      return actor.isUserBlockedSongSubmission(identity.getPrincipal());
    },
    enabled: !!actor && !!identity,
  });
}

export function useIsCurrentUserBlockedPodcastSubmission() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isCurrentUserBlockedPodcastSubmission', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return false;
      return actor.isUserBlockedPodcastSubmission(identity.getPrincipal());
    },
    enabled: !!actor && !!identity,
  });
}

export function useIsUserBlockedSongSubmission() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (user: Principal): Promise<boolean> => {
      if (!actor) throw new Error('Actor not available');
      return actor.isUserBlockedSongSubmission(user);
    },
  });
}

export function useIsUserBlockedPodcastSubmission() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (user: Principal): Promise<boolean> => {
      if (!actor) throw new Error('Actor not available');
      return actor.isUserBlockedPodcastSubmission(user);
    },
  });
}

export function useGetAllBlockedUsers() {
  const { actor, isFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['blockedUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBlockedUsersAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpgradeUserToTeamMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.upgradeUserToTeamMember(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
    },
  });
}

export function useDowngradeTeamMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.downgradeTeamMember(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
    },
  });
}

export function useGetAllTeamMembers() {
  const { actor, isFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTeamMembers();
    },
    enabled: !!actor && !isFetching,
  });
}

// ================================
// PODCAST SUBMISSIONS
// ================================
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
      await actor.approvePodcast(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPodcasts'] });
      queryClient.invalidateQueries({ queryKey: ['myPodcastShows'] });
    },
  });
}

export function useRejectPodcast() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.rejectPodcast(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPodcasts'] });
      queryClient.invalidateQueries({ queryKey: ['myPodcastShows'] });
    },
  });
}

export function useMarkPodcastLive() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, liveLink }: { id: string; liveLink: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.markPodcastLive(id, liveLink);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPodcasts'] });
      queryClient.invalidateQueries({ queryKey: ['myPodcastShows'] });
    },
  });
}

export function useCreatePodcastEpisode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PodcastEpisodeInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPodcastEpisode(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['podcastEpisodes'] });
      queryClient.invalidateQueries({ queryKey: ['allEpisodes'] });
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
      await actor.approveEpisode(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allEpisodes'] });
      queryClient.invalidateQueries({ queryKey: ['podcastEpisodes'] });
    },
  });
}

export function useRejectEpisode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.rejectEpisode(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allEpisodes'] });
      queryClient.invalidateQueries({ queryKey: ['podcastEpisodes'] });
    },
  });
}

export function useMarkEpisodeLive() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.markEpisodeLive(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allEpisodes'] });
      queryClient.invalidateQueries({ queryKey: ['podcastEpisodes'] });
    },
  });
}

// ================================
// INVITE LINKS / RSVP
// ================================
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

export function useSubmitRSVP() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      attending,
      inviteCode,
    }: {
      name: string;
      attending: boolean;
      inviteCode: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.submitRSVP(name, attending, inviteCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rsvps'] });
    },
  });
}

export function useGetAllRSVPs() {
  const { actor, isFetching } = useActor();

  return useQuery<RSVP[]>({
    queryKey: ['rsvps'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRSVPs();
    },
    enabled: !!actor && !isFetching,
  });
}

// Backward compatibility aliases
export const useGetVerificationRequestsForAdmin = useGetVerificationRequests;
export const useGetVerifiedArtistStatus = useIsArtistVerified;
