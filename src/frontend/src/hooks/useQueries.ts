import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, SubmitSongInput, SongSubmission, ArtistProfile, SaveArtistProfileInput, VerificationStatus, VerificationRequestWithFullName, SongStatus, AppUserRole, BlogPost, BlogPostInput, ACRResult, PreSaveInput } from '../backend';
import { toast } from 'sonner';
import { Principal } from '@icp-sdk/core/principal';

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
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

export function useGetArtistProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<ArtistProfile | null>({
    queryKey: ['artistProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getArtistProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
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
      queryClient.invalidateQueries({ queryKey: ['allArtistsWithUserIds'] });
      toast.success('Your artist profile has been created successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save artist profile: ${error.message}`);
    },
  });
}

export function useUpdateArtistProfile() {
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
      queryClient.invalidateQueries({ queryKey: ['allArtistsWithUserIds'] });
      toast.success('Artist profile updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update artist profile: ${error.message}`);
    },
  });
}

export function useHasCompleteArtistProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['hasCompleteArtistProfile'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.hasCompleteArtistProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetArtistProfileByUserId() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = { __principal__: userId };
      return actor.getArtistProfileByUserId(principal as any);
    },
  });
}

export function useGetAllArtistsWithUserIds() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[Principal, ArtistProfile]>>({
    queryKey: ['allArtistsWithUserIds'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllArtistsWithUserIds();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useIsCurrentUserAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetCallerRole() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<AppUserRole>({
    queryKey: ['callerRole', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerRole();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useIsCallerTeamMember() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isTeamMember', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerTeamMember();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useUpgradeUserToTeam() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(userId);
      return actor.upgradeUserToTeam(principal as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTeamMembers'] });
      toast.success('User upgraded to team member successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to upgrade user: ${error.message}`);
    },
  });
}

export function useDowngradeTeamToUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(userId);
      return actor.downgradeTeamToUser(principal as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTeamMembers'] });
      toast.success('Team member downgraded to regular user successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to downgrade team member: ${error.message}`);
    },
  });
}

export function useGetAllTeamMembers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['allTeamMembers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTeamMembers();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useDeleteUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(userId);
      return actor.deleteUser(principal as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allArtistsWithUserIds'] });
      queryClient.invalidateQueries({ queryKey: ['allTeamMembers'] });
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['allVerificationRequests'] });
      queryClient.invalidateQueries({ queryKey: ['allArtists'] });
      toast.success('User deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete user: ${error.message}`);
    },
  });
}

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
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit song: ${error.message}`);
    },
  });
}

export function useUpdateSongSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submission: SongSubmission) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateSongSubmission(submission);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
      toast.success('Submission updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update submission: ${error.message}`);
    },
  });
}

export function useGetUserSubmissions() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<SongSubmission[]>({
    queryKey: ['userSubmissions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserSubmissions();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetAllSubmissions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SongSubmission[]>({
    queryKey: ['allSubmissions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSubmissions();
    },
    enabled: !!actor && !actorFetching,
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
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
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
      toast.success('Submission deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete submission: ${error.message}`);
    },
  });
}

export function useAdminEditSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submission: SongSubmission) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminEditSubmission(submission);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['userSubmissions'] });
      toast.success('Submission updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update submission: ${error.message}`);
    },
  });
}

export function useAdminEditArtistProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ artistPrincipal, profile }: { artistPrincipal: string; profile: ArtistProfile }) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(artistPrincipal);
      return actor.adminEditArtistProfile(principal as any, profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allArtists'] });
      queryClient.invalidateQueries({ queryKey: ['allArtistsWithUserIds'] });
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['allVerificationRequests'] });
      queryClient.invalidateQueries({ queryKey: ['artistProfile'] });
      toast.success('Artist profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update artist profile: ${error.message}`);
    },
  });
}

export function useGetDashboardSummary() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string>({
    queryKey: ['dashboardSummary'],
    queryFn: async () => {
      if (!actor) return '';
      return actor.getDashboardSummary();
    },
    enabled: !!actor && !actorFetching,
  });
}

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
    onError: (error: Error) => {
      toast.error(`Failed to generate invite code: ${error.message}`);
    },
  });
}

export function useGetInviteCodes() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['inviteCodes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getInviteCodes();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllArtists() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ArtistProfile[]>({
    queryKey: ['allArtists'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllArtists();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAnnouncement() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<string>({
    queryKey: ['announcement'],
    queryFn: async () => {
      if (!actor) return '';
      return actor.getAnnouncement();
    },
    enabled: !!actor && !actorFetching && !!identity,
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
      toast.success('Announcement updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update announcement: ${error.message}`);
    },
  });
}

export function useGetDistributionFee() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['distributionFee'],
    queryFn: async () => {
      if (!actor) return BigInt(199);
      return actor.getDistributionFee();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAnnualMaintenanceFee() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['annualMaintenanceFee'],
    queryFn: async () => {
      if (!actor) return BigInt(1000);
      return actor.getAnnualMaintenanceFee();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetDistributionFee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fee: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setDistributionFee(BigInt(fee));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributionFee'] });
      toast.success('Distribution fee updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update distribution fee: ${error.message}`);
    },
  });
}

export function useSetAnnualMaintenanceFee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fee: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setAnnualMaintenanceFee(BigInt(fee));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annualMaintenanceFee'] });
      toast.success('Annual maintenance fee updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update annual maintenance fee: ${error.message}`);
    },
  });
}

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
      toast.success('Comment saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save comment: ${error.message}`);
    },
  });
}

export function useGetSongComment() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (songId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSongComment(songId);
    },
  });
}

// Verification Subscription Hooks
export function useGetVerificationStatus() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<VerificationStatus>({
    queryKey: ['verificationStatus'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getVerificationStatus();
    },
    enabled: !!actor && !actorFetching && !!identity,
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
      queryClient.invalidateQueries({ queryKey: ['verificationBadgeActive'] });
      toast.success('Verification application submitted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to apply for verification: ${error.message}`);
    },
  });
}

export function useGetAllVerificationRequests() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<VerificationRequestWithFullName[]>({
    queryKey: ['allVerificationRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVerificationRequests();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUpdateVerificationStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: VerificationStatus }) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(userId);
      return actor.updateVerificationStatus(principal as any, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allVerificationRequests'] });
      queryClient.invalidateQueries({ queryKey: ['verificationBadgeActive'] });
      toast.success('Verification status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update verification status: ${error.message}`);
    },
  });
}

export function useUpdateVerificationExpiryDays() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, extraDays }: { userId: string; extraDays: number }) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(userId);
      return actor.updateVerificationExpiryDays(principal as any, BigInt(extraDays));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allVerificationRequests'] });
      queryClient.invalidateQueries({ queryKey: ['verificationBadgeActive'] });
      toast.success('Verification expiry updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update verification expiry: ${error.message}`);
    },
  });
}

// Verification Badge Hooks
export function useIsVerificationBadgeActive() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['verificationBadgeActive'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isVerificationBadgeActive();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useIsUserVerificationBadgeActive(userId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['userVerificationBadgeActive', userId],
    queryFn: async () => {
      if (!actor || !userId) return false;
      try {
        const principal = Principal.fromText(userId);
        return await actor.isUserVerificationBadgeActive(principal as any);
      } catch {
        return false;
      }
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

// Artist Profile Editing Access Control Hooks
export function useGetArtistProfileEditingAccessStatus() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['artistProfileEditingAccessStatus'],
    queryFn: async () => {
      if (!actor) return true;
      try {
        return await actor.getArtistProfileEditingAccessStatus();
      } catch {
        return true;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
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
      toast.success('Profile editing access updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update profile editing access: ${error.message}`);
    },
  });
}

// Blog Hooks
export function useGetPublishedBlogPosts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<BlogPost[]>({
    queryKey: ['publishedBlogPosts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPublishedBlogPosts();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllBlogPosts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<BlogPost[]>({
    queryKey: ['allBlogPosts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBlogPosts();
    },
    enabled: !!actor && !actorFetching,
  });
}

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
      queryClient.invalidateQueries({ queryKey: ['publishedBlogPosts'] });
      toast.success('Blog post created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create blog post: ${error.message}`);
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
      queryClient.invalidateQueries({ queryKey: ['publishedBlogPosts'] });
      toast.success('Blog post updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update blog post: ${error.message}`);
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
      toast.success('Blog post published successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to publish blog post: ${error.message}`);
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
      toast.success('Blog post deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete blog post: ${error.message}`);
    },
  });
}

// ACRCloud Hooks
export function useGetAcrCloudResult(songId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ACRResult | null>({
    queryKey: ['acrCloudResult', songId],
    queryFn: async () => {
      if (!actor || !songId) return null;
      return actor.getAcrCloudResult(songId);
    },
    enabled: !!actor && !actorFetching && !!songId,
  });
}

export function useSetAcrResult() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ songId, acrResult }: { songId: string; acrResult: ACRResult }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setAcrResult(songId, acrResult);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['acrCloudResult', variables.songId] });
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['userSubmissions'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to save ACR result: ${error.message}`);
    },
  });
}

// Pre-save Hooks
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
      queryClient.invalidateQueries({ queryKey: ['userSubmissions'] });
      toast.success('Pre-save link created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create pre-save link: ${error.message}`);
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
      queryClient.invalidateQueries({ queryKey: ['userSubmissions'] });
      toast.success('Pre-save link deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete pre-save link: ${error.message}`);
    },
  });
}
