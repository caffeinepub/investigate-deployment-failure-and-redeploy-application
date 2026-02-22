import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Search, User, Ban, CheckCircle, Filter } from 'lucide-react';
import {
  useGetAllArtistsWithUserIds,
  useBlockUserSongSubmission,
  useUnblockUserSongSubmission,
  useBlockUserPodcastSubmission,
  useUnblockUserPodcastSubmission,
  useIsUserBlockedSongSubmission,
  useIsUserBlockedPodcastSubmission,
  useUpdateUserCategory,
  useGetCallerUserProfile,
} from '../hooks/useQueries';
import { Principal } from '@dfinity/principal';
import { UserCategory } from '../backend';
import { toast } from 'sonner';

interface UserBlockStatus {
  songBlocked: boolean;
  podcastBlocked: boolean;
}

interface UserCategoryMap {
  [key: string]: UserCategory;
}

const CATEGORY_LABELS: Record<UserCategory, string> = {
  generalArtist: 'General Artist',
  proArtist: 'Pro Artist',
  ultraArtist: 'Ultra Artist',
  generalLabel: 'General Label',
  proLabel: 'Pro Label',
};

const CATEGORY_COLORS: Record<UserCategory, string> = {
  generalArtist: 'bg-blue-100 text-blue-800 border-blue-200',
  proArtist: 'bg-purple-100 text-purple-800 border-purple-200',
  ultraArtist: 'bg-green-100 text-green-800 border-green-200',
  generalLabel: 'bg-orange-100 text-orange-800 border-orange-200',
  proLabel: 'bg-pink-100 text-pink-800 border-pink-200',
};

export default function AdminUserManagement() {
  const { data: artistProfiles, isLoading } = useGetAllArtistsWithUserIds();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<Principal | null>(null);
  const [blockStatuses, setBlockStatuses] = useState<Map<string, UserBlockStatus>>(new Map());
  const [userCategories, setUserCategories] = useState<UserCategoryMap>({});
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const blockSongMutation = useBlockUserSongSubmission();
  const unblockSongMutation = useUnblockUserSongSubmission();
  const blockPodcastMutation = useBlockUserPodcastSubmission();
  const unblockPodcastMutation = useUnblockUserPodcastSubmission();
  const checkSongBlockMutation = useIsUserBlockedSongSubmission();
  const checkPodcastBlockMutation = useIsUserBlockedPodcastSubmission();
  const updateCategoryMutation = useUpdateUserCategory();

  // Get unique users
  const uniqueUsers = artistProfiles
    ? Array.from(
        new Map(artistProfiles.map((profile) => [profile.owner.toString(), profile])).values()
      )
    : [];

  // Filter users based on search and category
  const filteredUsers = uniqueUsers.filter((profile) => {
    const matchesSearch =
      profile.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.stageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.owner.toString().toLowerCase().includes(searchTerm.toLowerCase());

    const userKey = profile.owner.toString();
    const userCategory = userCategories[userKey];

    const matchesCategory =
      categoryFilter === 'all' || (userCategory && userCategory === categoryFilter);

    return matchesSearch && matchesCategory;
  });

  // Load block statuses and user categories for all users
  useEffect(() => {
    const loadUserData = async () => {
      const newStatuses = new Map<string, UserBlockStatus>();
      const newCategories: UserCategoryMap = {};

      for (const profile of uniqueUsers) {
        try {
          const songBlocked = await checkSongBlockMutation.mutateAsync(profile.owner);
          const podcastBlocked = await checkPodcastBlockMutation.mutateAsync(profile.owner);
          newStatuses.set(profile.owner.toString(), { songBlocked, podcastBlocked });

          // Fetch user profile to get category
          const userProfileResponse = await fetch(
            `/api/getUserProfile?principal=${profile.owner.toString()}`
          ).catch(() => null);

          if (userProfileResponse) {
            const userProfile = await userProfileResponse.json();
            if (userProfile?.category) {
              newCategories[profile.owner.toString()] = userProfile.category;
            } else {
              newCategories[profile.owner.toString()] = 'generalArtist' as UserCategory;
            }
          } else {
            newCategories[profile.owner.toString()] = 'generalArtist' as UserCategory;
          }
        } catch (error) {
          console.error('Failed to load user data:', error);
          newCategories[profile.owner.toString()] = 'generalArtist' as UserCategory;
        }
      }

      setBlockStatuses(newStatuses);
      setUserCategories(newCategories);
    };

    if (uniqueUsers.length > 0) {
      loadUserData();
    }
  }, [uniqueUsers.length]);

  const handleToggleSongBlock = async (user: Principal) => {
    const userKey = user.toString();
    const currentStatus = blockStatuses.get(userKey);

    try {
      if (currentStatus?.songBlocked) {
        await unblockSongMutation.mutateAsync(user);
      } else {
        await blockSongMutation.mutateAsync(user);
      }

      // Update local state
      setBlockStatuses((prev) => {
        const newMap = new Map(prev);
        newMap.set(userKey, {
          ...currentStatus,
          songBlocked: !currentStatus?.songBlocked,
        } as UserBlockStatus);
        return newMap;
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update block status');
    }
  };

  const handleTogglePodcastBlock = async (user: Principal) => {
    const userKey = user.toString();
    const currentStatus = blockStatuses.get(userKey);

    try {
      if (currentStatus?.podcastBlocked) {
        await unblockPodcastMutation.mutateAsync(user);
      } else {
        await blockPodcastMutation.mutateAsync(user);
      }

      // Update local state
      setBlockStatuses((prev) => {
        const newMap = new Map(prev);
        newMap.set(userKey, {
          ...currentStatus,
          podcastBlocked: !currentStatus?.podcastBlocked,
        } as UserBlockStatus);
        return newMap;
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update block status');
    }
  };

  const handleCategoryChange = async (user: Principal, newCategory: UserCategory) => {
    const userKey = user.toString();

    try {
      await updateCategoryMutation.mutateAsync({ userId: user, category: newCategory });

      // Update local state
      setUserCategories((prev) => ({
        ...prev,
        [userKey]: newCategory,
      }));
    } catch (error: any) {
      toast.error(error.message || 'Failed to update category');
    }
  };

  const openUserDetails = (user: Principal) => {
    setSelectedUser(user);
  };

  const closeUserDetails = () => {
    setSelectedUser(null);
  };

  const selectedUserProfile = artistProfiles?.find(
    (p) => p.owner.toString() === selectedUser?.toString()
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-4">
            <div>
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or principal ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category-filter">Filter by Category</Label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger id="category-filter" className="pl-10">
                    <SelectValue placeholder="All Users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="generalArtist">General Artist</SelectItem>
                    <SelectItem value="proArtist">Pro Artist</SelectItem>
                    <SelectItem value="ultraArtist">Ultra Artist</SelectItem>
                    <SelectItem value="generalLabel">General Label</SelectItem>
                    <SelectItem value="proLabel">Pro Label</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Stage Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Principal ID</TableHead>
                    <TableHead className="text-center">Block Song Submissions</TableHead>
                    <TableHead className="text-center">Block Podcast Submissions</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((profile) => {
                    const userKey = profile.owner.toString();
                    const status = blockStatuses.get(userKey);
                    const category = userCategories[userKey] || ('generalArtist' as UserCategory);

                    return (
                      <TableRow key={userKey}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {profile.fullName}
                            <Badge
                              variant="outline"
                              className={`text-xs ${CATEGORY_COLORS[category]}`}
                            >
                              {CATEGORY_LABELS[category]}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{profile.stageName}</TableCell>
                        <TableCell>
                          <Select
                            value={category}
                            onValueChange={(value) =>
                              handleCategoryChange(profile.owner, value as UserCategory)
                            }
                            disabled={updateCategoryMutation.isPending}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="generalArtist">General Artist</SelectItem>
                              <SelectItem value="proArtist">Pro Artist</SelectItem>
                              <SelectItem value="ultraArtist">Ultra Artist</SelectItem>
                              <SelectItem value="generalLabel">General Label</SelectItem>
                              <SelectItem value="proLabel">Pro Label</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {userKey.slice(0, 10)}...{userKey.slice(-8)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Switch
                              checked={status?.songBlocked || false}
                              onCheckedChange={() => handleToggleSongBlock(profile.owner)}
                              disabled={
                                blockSongMutation.isPending || unblockSongMutation.isPending
                              }
                            />
                            {status?.songBlocked ? (
                              <Badge variant="destructive" className="text-xs">
                                <Ban className="w-3 h-3 mr-1" />
                                Blocked
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Switch
                              checked={status?.podcastBlocked || false}
                              onCheckedChange={() => handleTogglePodcastBlock(profile.owner)}
                              disabled={
                                blockPodcastMutation.isPending ||
                                unblockPodcastMutation.isPending
                              }
                            />
                            {status?.podcastBlocked ? (
                              <Badge variant="destructive" className="text-xs">
                                <Ban className="w-3 h-3 mr-1" />
                                Blocked
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openUserDetails(profile.owner)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {uniqueUsers.length} users
          </div>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && closeUserDetails()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View and manage user submission access and category
            </DialogDescription>
          </DialogHeader>

          {selectedUserProfile && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Full Name</Label>
                  <p className="font-medium">{selectedUserProfile.fullName}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Stage Name</Label>
                  <p className="font-medium">{selectedUserProfile.stageName}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedUserProfile.email}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Mobile</Label>
                  <p className="font-medium">{selectedUserProfile.mobileNumber}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">User Category</h3>
                <div className="flex items-center gap-3">
                  <Select
                    value={userCategories[selectedUser?.toString() || ''] || 'generalArtist'}
                    onValueChange={(value) =>
                      selectedUser && handleCategoryChange(selectedUser, value as UserCategory)
                    }
                    disabled={updateCategoryMutation.isPending}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="generalArtist">General Artist</SelectItem>
                      <SelectItem value="proArtist">Pro Artist</SelectItem>
                      <SelectItem value="ultraArtist">Ultra Artist</SelectItem>
                      <SelectItem value="generalLabel">General Label</SelectItem>
                      <SelectItem value="proLabel">Pro Label</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge
                    variant="outline"
                    className={CATEGORY_COLORS[userCategories[selectedUser?.toString() || ''] || 'generalArtist']}
                  >
                    {CATEGORY_LABELS[userCategories[selectedUser?.toString() || ''] || 'generalArtist']}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Submission Access</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Song Submissions</Label>
                      <p className="text-sm text-muted-foreground">
                        Block user from submitting songs
                      </p>
                    </div>
                    <Switch
                      checked={blockStatuses.get(selectedUser?.toString() || '')?.songBlocked || false}
                      onCheckedChange={() => selectedUser && handleToggleSongBlock(selectedUser)}
                      disabled={blockSongMutation.isPending || unblockSongMutation.isPending}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Podcast Submissions</Label>
                      <p className="text-sm text-muted-foreground">
                        Block user from submitting podcasts
                      </p>
                    </div>
                    <Switch
                      checked={blockStatuses.get(selectedUser?.toString() || '')?.podcastBlocked || false}
                      onCheckedChange={() => selectedUser && handleTogglePodcastBlock(selectedUser)}
                      disabled={blockPodcastMutation.isPending || unblockPodcastMutation.isPending}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
