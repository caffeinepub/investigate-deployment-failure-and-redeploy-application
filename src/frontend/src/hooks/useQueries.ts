import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import {
  SongSubmission,
  SubmitSongInput,
  ArtistProfile,
  SaveArtistProfileInput,
  UserProfile,
  VerificationStatus,
  SongStatus,
  BlogPost,
  BlogPostInput,
  CommunityMessage,
  CommunityMessageInput,
  ACRResult,
  PreSaveInput,
  PodcastShowInput,
  PodcastEpisodeInput,
  PodcastShow,
  PodcastEpisode,
  AppUserRole,
  InviteCode,
} from '../backend';
import { toast } from 'sonner';

// Song Submissions
export function useSubmitSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SubmitSongInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitSong(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
      toast.success('Song submitted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit song');
    },
  });
}

export function useGetUserSubmissions() {
  const { actor, isFetching } = useActor();

  return useQuery<SongSubmission[]>({
    queryKey: ['userSubmissions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserSubmissions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllSubmissions() {
  const { actor, isFetching } = useActor();

  return useQuery<SongSubmission[]>({
    queryKey: ['allSubmissions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSubmissions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateSubmissionStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, remarks }: { id: string; status: SongStatus; remarks: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateSubmissionStatus(id, status, remarks);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['userSubmissions'] });
      toast.success('Submission status updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update status');
    },
  });
}

export function useDeleteSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteSubmission(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['userSubmissions'] });
      toast.success('Submission deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete submission');
    },
  });
}

export function useUpdateSongSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedSubmission: SongSubmission) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateSongSubmission(updatedSubmission);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
      toast.success('Submission updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update submission');
    },
  });
}

export function useAdminEditSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (update: SongSubmission) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminEditSubmission(update);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['userSubmissions'] });
      toast.success('Submission updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update submission');
    },
  });
}

// Artist Profile
export function useGetArtistProfile() {
  const { actor, isFetching } = useActor();

  return useQuery<ArtistProfile | null>({
    queryKey: ['artistProfile'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getArtistProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useHasCompleteArtistProfile() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['hasCompleteArtistProfile'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.hasCompleteArtistProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveArtistProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SaveArtistProfileInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveArtistProfile(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artistProfile'] });
      queryClient.invalidateQueries({ queryKey: ['hasCompleteArtistProfile'] });
      queryClient.invalidateQueries({ queryKey: ['allArtists'] });
      toast.success('Artist profile saved successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save artist profile');
    },
  });
}

export function useGetAllArtists() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[any, ArtistProfile]>>({
    queryKey: ['allArtists'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllArtistsWithUserIds();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminEditArtistProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ artist, profile }: { artist: any; profile: ArtistProfile }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminEditArtistProfile(artist, profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allArtists'] });
      toast.success('Artist profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update artist profile');
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
      toast.success('Profile saved successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save profile');
    },
  });
}

export function useGetCallerRole() {
  const { actor, isFetching } = useActor();

  return useQuery<AppUserRole>({
    queryKey: ['callerRole'],
    queryFn: async () => {
      if (!actor) return AppUserRole.user;
      return actor.getCallerRole();
    },
    enabled: !!actor && !isFetching,
  });
}

// Comments
export function useAddSongComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ songId, comment }: { songId: string; comment: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addSongComment(songId, comment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['userSubmissions'] });
      toast.success('Comment added');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add comment');
    },
  });
}

// Announcements
export function useGetAnnouncement() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ['announcement'],
    queryFn: async () => {
      if (!actor) return '';
      return actor.getAnnouncement();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateAnnouncement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (announcement: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAnnouncement(announcement);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcement'] });
      toast.success('Announcement updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update announcement');
    },
  });
}

// Fees
export function useGetDistributionFee() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['distributionFee'],
    queryFn: async () => {
      if (!actor) return BigInt(199);
      return actor.getDistributionFee();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAnnualMaintenanceFee() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['annualMaintenanceFee'],
    queryFn: async () => {
      if (!actor) return BigInt(1000);
      return actor.getAnnualMaintenanceFee();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetDistributionFee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fee: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setDistributionFee(fee);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributionFee'] });
      toast.success('Distribution fee updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update fee');
    },
  });
}

export function useSetAnnualMaintenanceFee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fee: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setAnnualMaintenanceFee(fee);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annualMaintenanceFee'] });
      toast.success('Annual maintenance fee updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update fee');
    },
  });
}

// Verification
export function useGetVerificationStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<VerificationStatus>({
    queryKey: ['verificationStatus'],
    queryFn: async () => {
      if (!actor) return 'rejected' as VerificationStatus;
      return actor.getVerificationStatus();
    },
    enabled: !!actor && !isFetching,
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
      queryClient.invalidateQueries({ queryKey: ['verificationStatus'] });
      queryClient.invalidateQueries({ queryKey: ['allVerificationRequests'] });
      toast.success('Verification request submitted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit verification request');
    },
  });
}

export function useGetAllVerificationRequests() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['allVerificationRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVerificationRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateVerificationStatusWithData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: VerificationStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateVerificationStatusWithData(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allVerificationRequests'] });
      queryClient.invalidateQueries({ queryKey: ['verificationStatus'] });
      toast.success('Verification status updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update verification status');
    },
  });
}

export function useUpdateVerificationExpiryDays() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, extraDays }: { userId: any; extraDays: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateVerificationExpiryDays(userId, extraDays);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allVerificationRequests'] });
      toast.success('Verification expiry updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update expiry');
    },
  });
}

export function useIsVerificationBadgeActive() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isVerificationBadgeActive'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isVerificationBadgeActive();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsUserVerificationBadgeActive(userId: any) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isUserVerificationBadgeActive', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return false;
      return actor.isUserVerificationBadgeActive(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

// Team Management
export function useUpgradeUserToTeam() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: any) => {
      if (!actor) throw new Error('Actor not available');
      return actor.upgradeUserToTeam(user);
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

export function useDowngradeTeamToUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: any) => {
      if (!actor) throw new Error('Actor not available');
      return actor.downgradeTeamToUser(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTeamMembers'] });
      toast.success('Team member downgraded to user');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to downgrade user');
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

export function useDeleteUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: any) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteUser(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allArtists'] });
      queryClient.invalidateQueries({ queryKey: ['allTeamMembers'] });
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });
}

// Invite Codes
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

// Blog Posts
export function useCreateBlogPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: BlogPostInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createBlogPost(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBlogPosts'] });
      toast.success('Blog post created');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create blog post');
    },
  });
}

export function useUpdateBlogPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: BlogPostInput }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBlogPost(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBlogPosts'] });
      toast.success('Blog post updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update blog post');
    },
  });
}

export function usePublishBlogPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.publishBlogPost(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBlogPosts'] });
      queryClient.invalidateQueries({ queryKey: ['publishedBlogPosts'] });
      toast.success('Blog post published');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to publish blog post');
    },
  });
}

export function useDeleteBlogPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBlogPost(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBlogPosts'] });
      queryClient.invalidateQueries({ queryKey: ['publishedBlogPosts'] });
      toast.success('Blog post deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete blog post');
    },
  });
}

export function useGetAllBlogPosts() {
  const { actor, isFetching } = useActor();

  return useQuery<BlogPost[]>({
    queryKey: ['allBlogPosts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBlogPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPublishedBlogPosts() {
  const { actor, isFetching } = useActor();

  return useQuery<BlogPost[]>({
    queryKey: ['publishedBlogPosts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPublishedBlogPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

// ACRCloud
export function useSetAcrResult() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ songId, acrResult }: { songId: string; acrResult: ACRResult }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setAcrResult(songId, acrResult);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
      toast.success('ACR result saved');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save ACR result');
    },
  });
}

export function useGetAcrCloudResult(songId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ACRResult | null>({
    queryKey: ['acrResult', songId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAcrCloudResult(songId);
    },
    enabled: !!actor && !isFetching && !!songId,
  });
}

// Pre-save Links
export function useCreatePreSave() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PreSaveInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPreSave(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
      toast.success('Pre-save link created');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create pre-save link');
    },
  });
}

export function useDeletePreSaveLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (songId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deletePreSaveLink(songId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
      toast.success('Pre-save link deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete pre-save link');
    },
  });
}

// Podcast Queries
export function useCreatePodcastShow() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PodcastShowInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPodcastShow(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['podcastEpisodesByUser'] });
      queryClient.invalidateQueries({ queryKey: ['allPodcasts'] });
      toast.success('Podcast show created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create podcast show');
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
      queryClient.invalidateQueries({ queryKey: ['podcastEpisodesByUser'] });
      queryClient.invalidateQueries({ queryKey: ['allEpisodes'] });
      toast.success('Episode created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create episode');
    },
  });
}

export function useGetPodcastEpisodesByUser() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[PodcastShow, PodcastEpisode[]]>>({
    queryKey: ['podcastEpisodesByUser'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPodcastEpisodesByUser();
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

// Profile Editing Access Control
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
      toast.success('Profile editing access updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update access');
    },
  });
}
