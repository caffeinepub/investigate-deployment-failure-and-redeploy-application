import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import {
  SongSubmission,
  SongSubmissionInput,
  SongSubmissionEditInput,
  ArtistProfile,
  SaveArtistProfileInput,
  UserProfile,
  VerificationRequest,
  VerificationStatus,
  PodcastShow,
  PodcastShowInput,
  PodcastEpisode,
  PodcastEpisodeInput,
  VideoSubmission,
  VideoSubmissionInput,
  VideoSubmissionStatus,
  FeaturedArtist,
  FeaturedArtistInput,
  SubscriptionPlan,
  UserCategory,
  TopVibingSong,
  PublicSongInfo,
  InviteCode,
  RSVP,
} from '../backend';
import { useInternetIdentity } from './useInternetIdentity';
import { Principal } from '@dfinity/principal';

// ================================
// USER PROFILE HOOKS
// ================================
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

export function useIsCallerAdmin() {
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
// PUBLIC SONG INFO (NO AUTH REQUIRED)
// ================================
export function useGetSongInfo(songId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<PublicSongInfo>({
    queryKey: ['songInfo', songId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSongInfo(songId);
    },
    enabled: !!actor && !isFetching && !!songId,
    retry: false,
  });
}

// ================================
// ARTIST PROFILE HOOKS
// ================================
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

export function useGetAllArtistProfilesForAdmin() {
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

// Alias used by several components
export function useGetAllArtistProfiles() {
  return useGetAllArtistProfilesForAdmin();
}

// Alias used by AdminUserManagement and AdminVerificationList
export function useGetAllArtistsWithUserIds() {
  return useGetAllArtistProfilesForAdmin();
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
      queryClient.invalidateQueries({ queryKey: ['allArtistProfiles'] });
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
      return actor.deleteArtistProfile(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myArtistProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['allArtistProfiles'] });
    },
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
    },
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

export function useSetArtistProfileEditingAccess() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setArtistProfileEditingAccess(enabled);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artistProfileEditingAccess'] });
    },
  });
}

// ================================
// SONG SUBMISSION HOOKS
// ================================
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
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
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
    },
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
      status: any;
      adminRemarks: string;
      adminComment: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminUpdateSubmission(id, status, adminRemarks, adminComment);
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
      return actor.adminSetSubmissionLive(id, liveUrl, adminRemarks, adminComment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
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
      return actor.adminEditSubmission(input);
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
      return actor.adminDeleteSubmission(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
    },
  });
}

// Alias for streaming links update (used by AdminManageLinksDialog)
export function useUpdateSongLinks() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      songId,
      spotifyLink,
      appleMusicLink,
    }: {
      songId: string;
      spotifyLink: string | null;
      appleMusicLink: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const submissions = await actor.getAllSubmissionsForAdmin();
      const submission = submissions.find((s) => s.id === songId);
      if (!submission) throw new Error('Song not found');

      const editInput: SongSubmissionEditInput = {
        songSubmissionId: songId,
        title: submission.title,
        releaseType: submission.releaseType,
        genre: submission.genre,
        language: submission.language,
        releaseDate: submission.releaseDate,
        artworkBlob: submission.artwork,
        artworkFilename: submission.artworkFilename,
        artist: submission.artist,
        featuredArtist: submission.featuredArtist,
        composer: submission.composer,
        producer: submission.producer,
        lyricist: submission.lyricist,
        audioFile: submission.audioFile,
        audioFilename: submission.audioFilename,
        additionalDetails: submission.additionalDetails,
        discountCode: submission.discountCode,
        musicVideoLink: submission.musicVideoLink,
        albumTracks: submission.albumTracks,
        spotifyLink: spotifyLink ?? undefined,
        appleMusicLink: appleMusicLink ?? undefined,
      };

      return actor.adminEditSubmission(editInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['mySubmissions'] });
    },
  });
}

// ================================
// VERIFICATION HOOKS
// ================================
export function useGetVerificationRequests() {
  const { actor, isFetching } = useActor();

  return useQuery<VerificationRequest[]>({
    queryKey: ['verificationRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVerificationRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export const useGetVerificationRequestsForAdmin = useGetVerificationRequests;

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
      return actor.updateVerificationStatus(verificationId, status, expiryExtensionDays);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verificationRequests'] });
    },
  });
}

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
    },
  });
}

// ================================
// BLOG HOOKS (actor as any — not in typed interface)
// ================================
export function useGetBlogPosts() {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['blogPosts'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getBlogPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateBlogPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: any) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).createBlogPost(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
    },
  });
}

export function useUpdateBlogPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: any }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updateBlogPost(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
    },
  });
}

export function useDeleteBlogPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).deleteBlogPost(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
    },
  });
}

export function usePublishBlogPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).publishBlogPost(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
    },
  });
}

// ================================
// COMMUNITY HOOKS (actor as any)
// ================================
export function useGetCommunityMessages() {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['communityMessages'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getCommunityMessages();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useSendCommunityMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).sendCommunityMessage({ content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityMessages'] });
    },
  });
}

// ================================
// PODCAST HOOKS
// ================================
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

export function useCreatePodcastEpisode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PodcastEpisodeInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPodcastEpisode(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPodcastShows'] });
    },
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
    },
  });
}

// ================================
// SUPPORT REQUEST HOOKS (actor as any)
// ================================
export function useGetMySupportRequests() {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['mySupportRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getMySupportRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllSupportRequests() {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['allSupportRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllSupportRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitSupportRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: any) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).submitSupportRequest(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySupportRequests'] });
    },
  });
}

export function useUpdateSupportRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: any) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updateSupportRequest(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSupportRequests'] });
    },
  });
}

// ================================
// VIDEO SUBMISSION HOOKS
// ================================
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
      queryClient.invalidateQueries({ queryKey: ['allVideoSubmissions'] });
    },
  });
}

export function useUpdateVideoStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      videoId,
      newStatus,
      liveUrl,
    }: {
      videoId: string;
      newStatus: VideoSubmissionStatus;
      liveUrl: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateVideoStatus(videoId, newStatus, liveUrl);
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
      return actor.updateVideoSubmission(input, videoId);
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
      return actor.deleteVideoSubmission(videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allVideoSubmissions'] });
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
// SUBSCRIPTION PLAN HOOKS
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
      return actor.createSubscriptionPlan(plan);
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
      return actor.updateSubscriptionPlan(plan);
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
      return actor.deleteSubscriptionPlan(planName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
    },
  });
}

// ================================
// FEATURED ARTISTS HOOKS
// ================================
export function useGetFeaturedArtists() {
  const { actor, isFetching } = useActor();

  return useQuery<FeaturedArtist[]>({
    queryKey: ['featuredArtists'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeaturedArtists();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetActiveFeaturedArtists() {
  const { actor, isFetching } = useActor();

  return useQuery<FeaturedArtist[]>({
    queryKey: ['activeFeaturedArtists'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveFeaturedArtists();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetFeaturedArtist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slot, data }: { slot: bigint; data: FeaturedArtistInput }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setFeaturedArtist(slot, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featuredArtists'] });
      queryClient.invalidateQueries({ queryKey: ['activeFeaturedArtists'] });
    },
  });
}

export function useToggleFeaturedArtistSlot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slot, active }: { slot: bigint; active: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleFeaturedArtistSlot(slot, active);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featuredArtists'] });
      queryClient.invalidateQueries({ queryKey: ['activeFeaturedArtists'] });
    },
  });
}

// ================================
// MONTHLY LISTENER STATS HOOKS
// ================================
export function useGetMyLiveSongsWithStats() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['myLiveSongsWithStats'],
    queryFn: async () => {
      if (!actor) return [];
      const submissions = await actor.getMySubmissions();
      const liveSongs = submissions.filter((s) => s.status === 'live');
      return liveSongs.map((song) => ({ song, stats: [] as any[] }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLiveSongsForAnalysis() {
  const { actor, isFetching } = useActor();

  return useQuery<SongSubmission[]>({
    queryKey: ['liveSongsForAnalysis'],
    queryFn: async () => {
      if (!actor) return [];
      const submissions = await actor.getAllSubmissionsForAdmin();
      return submissions.filter((s) => s.status === 'live');
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSongMonthlyListenerStats() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (songId: string) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).getSongMonthlyListenerStats(songId);
    },
  });
}

export function useSaveMonthlyListenerStats() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ songId, stats }: { songId: string; stats: any }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).saveMonthlyListenerStats(songId, stats);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLiveSongsWithStats'] });
    },
  });
}

// Alias used by AdminMonthlyListenersManagement
export function useUpdateMonthlyListenerStats() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ songId, stats }: { songId: string; stats: any }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).saveMonthlyListenerStats(songId, stats);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLiveSongsWithStats'] });
      queryClient.invalidateQueries({ queryKey: ['liveSongsForAnalysis'] });
    },
  });
}

// ================================
// ADMIN ROLE HOOKS
// ================================
export function usePromoteToAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (target: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.promoteToAdmin(target);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listAdmins'] });
    },
  });
}

export function useDemoteFromAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (target: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.demoteFromAdmin(target);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listAdmins'] });
    },
  });
}

// Alias used by AdminUserRoleManagement
export const useDemoteAdmin = useDemoteFromAdmin;

export function useListAdmins() {
  const { actor, isFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['listAdmins'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAdmins();
    },
    enabled: !!actor && !isFetching,
  });
}

// ================================
// INVITE LINKS HOOKS
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

export function useGetAllRSVPs() {
  const { actor, isFetching } = useActor();

  return useQuery<RSVP[]>({
    queryKey: ['allRSVPs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRSVPs();
    },
    enabled: !!actor && !isFetching,
  });
}

// ================================
// USER BLOCKING HOOKS
// ================================
export function useIsCurrentUserBlockedSongSubmission() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isCurrentUserBlockedSong', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return false;
      return actor.isUserBlockedSongSubmission(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useIsCurrentUserBlockedPodcastSubmission() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isCurrentUserBlockedPodcast', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return false;
      return actor.isUserBlockedPodcastSubmission(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useIsUserBlockedSongSubmission() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.isUserBlockedSongSubmission(user);
    },
  });
}

export function useIsUserBlockedPodcastSubmission() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.isUserBlockedPodcastSubmission(user);
    },
  });
}

export function useBlockUserSongSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.blockUserSongSubmission(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allArtistProfiles'] });
    },
  });
}

export function useUnblockUserSongSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unblockUserSongSubmission(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allArtistProfiles'] });
    },
  });
}

export function useBlockUserPodcastSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.blockUserPodcastSubmission(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allArtistProfiles'] });
    },
  });
}

export function useUnblockUserPodcastSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unblockUserPodcastSubmission(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allArtistProfiles'] });
    },
  });
}

// ================================
// USER CATEGORY HOOKS
// ================================
export function useUpdateUserCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, newCategory }: { userId: Principal; newCategory: UserCategory }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateUserCategory(userId, newCategory);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allArtistProfiles'] });
    },
  });
}

// ================================
// TOP VIBING SONGS HOOKS
// ================================
export function useGetAllTopVibingSongs() {
  const { actor, isFetching } = useActor();

  return useQuery<TopVibingSong[]>({
    queryKey: ['topVibingSongs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTopVibingSongs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRankedTopVibingSongs() {
  const { actor, isFetching } = useActor();

  return useQuery<TopVibingSong[]>({
    queryKey: ['topVibingSongs', 'ranked'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRankedTopVibingSongs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTopVibingSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (song: TopVibingSong) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTopVibingSong(song);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topVibingSongs'] });
    },
  });
}

export function useUpdateTopVibingSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (song: TopVibingSong) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTopVibingSong(song);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topVibingSongs'] });
    },
  });
}

export function useDeleteTopVibingSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteTopVibingSong(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topVibingSongs'] });
    },
  });
}

export function useReorderTopVibingSongs() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: bigint[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.reorderTopVibingSongs(ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topVibingSongs'] });
    },
  });
}
