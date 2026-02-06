import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, UserMinus, Search, Trash2 } from 'lucide-react';
import { useGetAllTeamMembers, useUpgradeUserToTeam, useDowngradeTeamToUser, useGetAllArtists, useDeleteUser } from '../hooks/useQueries';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Info } from 'lucide-react';

export default function AdminUserRoleManagement() {
  const { data: teamMembers } = useGetAllTeamMembers();
  const { data: artistsWithUserIds } = useGetAllArtists();
  const upgradeUser = useUpgradeUserToTeam();
  const downgradeUser = useDowngradeTeamToUser();
  const deleteUser = useDeleteUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [userToDelete, setUserToDelete] = useState<{ principal: any; name: string } | null>(null);

  // Transform the data for display
  const allUsers = useMemo(() => {
    if (!artistsWithUserIds) return [];
    
    return artistsWithUserIds.map(([principal, profile]) => ({
      principal,
      fullName: profile.fullName,
      stageName: profile.stageName,
      isTeamMember: teamMembers?.some((tm) => tm.toString() === (principal as any).toString()) || false,
    }));
  }, [artistsWithUserIds, teamMembers]);

  const filteredUsers = allUsers.filter((user) =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.stageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.principal as any).toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const teamMemberUsers = filteredUsers.filter((user) => user.isTeamMember);
  const regularUsers = filteredUsers.filter((user) => !user.isTeamMember);

  const handleUpgrade = async (principal: any) => {
    await upgradeUser.mutateAsync(principal);
  };

  const handleDowngrade = async (principal: any) => {
    await downgradeUser.mutateAsync(principal);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    await deleteUser.mutateAsync(userToDelete.principal);
    setUserToDelete(null);
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Team members have access to view submissions and manage artist profiles, but cannot modify platform settings or delete users.
        </AlertDescription>
      </Alert>

      <div>
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

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Team Members ({teamMemberUsers.length})</h3>
          {teamMemberUsers.length === 0 ? (
            <Card className="p-6">
              <p className="text-center text-muted-foreground">No team members yet</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {teamMemberUsers.map((user) => (
                <Card key={(user.principal as any).toString()} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{user.fullName}</h4>
                        <Badge variant="secondary">Team Member</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.stageName}</p>
                      <code className="text-xs text-muted-foreground">{(user.principal as any).toString()}</code>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDowngrade(user.principal)}
                        disabled={downgradeUser.isPending}
                      >
                        <UserMinus className="w-4 h-4 mr-2" />
                        Downgrade
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setUserToDelete({ principal: user.principal, name: user.fullName })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Regular Users ({regularUsers.length})</h3>
          {regularUsers.length === 0 ? (
            <Card className="p-6">
              <p className="text-center text-muted-foreground">
                {searchTerm ? 'No users found' : 'No regular users yet'}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {regularUsers.map((user) => (
                <Card key={(user.principal as any).toString()} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{user.fullName}</h4>
                      <p className="text-sm text-muted-foreground">{user.stageName}</p>
                      <code className="text-xs text-muted-foreground">{(user.principal as any).toString()}</code>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpgrade(user.principal)}
                        disabled={upgradeUser.isPending}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Upgrade to Team
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setUserToDelete({ principal: user.principal, name: user.fullName })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong>{userToDelete?.name}</strong>? This will remove their profile, all submissions, and verification requests. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
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
