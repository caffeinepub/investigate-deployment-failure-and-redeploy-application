import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Info } from 'lucide-react';
import { useGetArtistProfileEditingAccessStatus, useSetArtistProfileEditingAccess } from '../hooks/useQueries';

export default function AdminProfileEditingControl() {
  const { data: editingEnabled, isLoading } = useGetArtistProfileEditingAccessStatus();
  const setEditingAccess = useSetArtistProfileEditingAccess();
  const [localEnabled, setLocalEnabled] = useState(true);

  useEffect(() => {
    if (editingEnabled !== undefined) {
      setLocalEnabled(editingEnabled);
    }
  }, [editingEnabled]);

  const handleToggle = async (checked: boolean) => {
    setLocalEnabled(checked);
    try {
      await setEditingAccess.mutateAsync(checked);
    } catch (error) {
      // Revert on error
      setLocalEnabled(!checked);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-24 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-500" />
            Artist Profile Editing Access Control
          </CardTitle>
          <CardDescription>
            Control whether users can edit their artist profiles after creation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div className="space-y-1">
              <Label htmlFor="editing-toggle" className="text-base font-semibold cursor-pointer">
                Allow User Profile Editing
              </Label>
              <p className="text-sm text-muted-foreground">
                When enabled, users can edit their artist profiles (unless approved by admin)
              </p>
            </div>
            <Switch
              id="editing-toggle"
              checked={localEnabled}
              onCheckedChange={handleToggle}
              disabled={setEditingAccess.isPending}
            />
          </div>

          <Alert className="border-blue-500/50 bg-blue-500/10">
            <Info className="h-5 w-5 text-blue-500" />
            <AlertDescription>
              <strong>Current Status:</strong> User profile editing is{' '}
              <span className="font-semibold">{localEnabled ? 'enabled' : 'disabled'}</span>
              {!localEnabled && (
                <span>
                  . Users will see their profile fields as read-only and cannot make changes.
                </span>
              )}
            </AlertDescription>
          </Alert>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">How this works:</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>
                <strong>Enabled:</strong> Users can edit their artist profiles until an admin approves them
              </li>
              <li>
                <strong>Disabled:</strong> Users cannot edit their profiles at all, regardless of approval status
              </li>
              <li>
                <strong>Admin Access:</strong> Admins can always edit any artist profile, regardless of this setting
              </li>
              <li>
                <strong>Approved Profiles:</strong> Once approved by admin, users cannot edit their profiles even when this is enabled
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
