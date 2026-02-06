import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, UserMinus, Search, Trash2 } from 'lucide-react';
import { useGetAllTeamMembers, useUpgradeUserToTeam, useDowngradeTeamToUser, useGetAllArtistsWithUserIds, useDeleteUser } from '../hooks/useQueries';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Info } from 'lucide-react';

export default function AdminUserRoleManagement() {
  const { data: teamMembers } = useGetAllTeamMembers();
  const { data: artistsWithUserIds } = useGetAllArtistsWithUserIds();
  const upgradeUser = useUpgradeUserToTeam();
  const downgradeUser = useDowngradeTeamToUser();
  const deleteUser = useDeleteUser();
  const [userIdToUpgrade, setUserIdToUpgrade] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);

  // Create a map of user principals to their full names
  const userNameMap = useMemo(() => {
    if (!artistsWithUserIds) return new Map<string, string>();
    
    const map = new Map<string, string>();
    artistsWithUserIds.forEach(([principal, profile]) => {
      map.set((principal as any).toString(), profile.fullName);
    });
    return map;
  }, [artistsWithUserIds]);

  // Get all unique user principals from artist profiles
  const allUsers = artistsWithUserIds
    ? artistsWithUserIds.map(([principal]) => (principal as any).toString())
    : [];

  const teamMemberIds = teamMembers?.map((p) => p.toString()) || [];

  const handleUpgrade = async () => {
    if (!userIdToUpgrade.trim()) {
      alert('Please enter a valid user principal ID');
      return;
    }

    try {
      await upgradeUser.mutateAsync(userIdToUpgrade);
      setUserIdToUpgrade('');
    } catch (error) {
      console.error('Failed to upgrade user:', error);
    }
  };

  const handleDowngrade = async (userId: string) => {
    if (window.confirm('Are you sure you want to downgrade this team member to a regular user?')) {
      try {
        await downgradeUser.mutateAsync(userId);
      } catch (error) {
        console.error('Failed to downgrade user:', error);
      }
    }
  };

  const handleDeleteClick = (userId: string) => {
    const userName = userNameMap.get(userId) || 'Unknown User';
    setUserToDelete({ id: userId, name: userName });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser.mutateAsync(userToDelete.id);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const filteredUsers = allUsers.filter((userId) => {
    const userName = userNameMap.get(userId) || '';
    return (
      userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <Alert className="border-blue-500/50 bg-blue-500/10">
        <Info className="h-5 w-5 text-blue-500" />
        <AlertDescription>
          Team members can review submissions, add comments, and change submission status, but cannot edit submissions, delete them, or manage artist profiles, fees, or announcements.
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Upgrade User to Team Member</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="userId">User Principal ID</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="userId"
                placeholder="Enter user principal ID..."
                value={userIdToUpgrade}
                onChange={(e) => setUserIdToUpgrade(e.target.value)}
              />
              <Button
                onClick={handleUpgrade}
                disabled={upgradeUser.isPending || !userIdToUpgrade.trim()}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Upgrade
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Current Team Members</h3>
        {teamMembers && teamMembers.length > 0 ? (
          <div className="space-y-3">
            {teamMembers.map((member) => {
              const memberId = member.toString();
              const memberName = userNameMap.get(memberId);
              
              return (
                <div
                  key={memberId}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge className="bg-purple-600">Team Member</Badge>
                    <div className="flex flex-col">
                      {memberName && (
                        <span className="font-medium">{memberName}</span>
                      )}
                      <code className="text-xs text-muted-foreground">{memberId}</code>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDowngrade(memberId)}
                    disabled={downgradeUser.isPending}
                  >
                    <UserMinus className="w-4 h-4 mr-2" />
                    Downgrade
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No team members yet</p>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">All Users (from Artist Profiles)</h3>
        <div className="mb-4">
          <Label htmlFor="search">Search Users</Label>
          <div className="relative mt-2">
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
        {filteredUsers.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredUsers.map((userId) => {
              const isTeamMember = teamMemberIds.includes(userId);
              const userName = userNameMap.get(userId);
              
              return (
                <div
                  key={userId}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {isTeamMember && <Badge className="bg-purple-600">Team Member</Badge>}
                    <div className="flex flex-col">
                      {userName && (
                        <span className="font-medium">{userName}</span>
                      )}
                      <code className="text-xs text-muted-foreground">{userId}</code>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!isTeamMember && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setUserIdToUpgrade(userId);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Upgrade
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteClick(userId)}
                      disabled={deleteUser.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            {searchTerm ? 'No users found' : 'No users yet'}
          </p>
        )}
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to permanently delete <strong>{userToDelete?.name}</strong>?
              </p>
              <p className="text-destructive font-semibold">
                This action cannot be undone. This will permanently delete:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>User's artist profile</li>
                <li>All song submissions</li>
                <li>Verification data</li>
                <li>All associated comments</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
