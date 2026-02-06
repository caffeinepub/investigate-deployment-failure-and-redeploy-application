import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Megaphone, Save } from 'lucide-react';
import { useGetAnnouncement, useUpdateAnnouncement } from '../hooks/useQueries';

export default function AdminAnnouncementSection() {
  const { data: currentAnnouncement, isLoading } = useGetAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();
  const [announcementText, setAnnouncementText] = useState('');

  useEffect(() => {
    if (currentAnnouncement !== undefined) {
      setAnnouncementText(currentAnnouncement);
    }
  }, [currentAnnouncement]);

  const handleSave = () => {
    updateAnnouncement.mutate(announcementText);
  };

  const hasChanges = announcementText !== (currentAnnouncement || '');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle>Global Announcement</CardTitle>
            <CardDescription>
              Create an announcement that will be displayed to all users when they log in
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="announcement">Announcement Message</Label>
          <Textarea
            id="announcement"
            placeholder="Enter your announcement message here... (Leave empty to disable announcements)"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            rows={6}
            className="resize-none"
            disabled={isLoading}
          />
          <p className="text-sm text-muted-foreground">
            This message will appear in a popup to all users upon login. Leave empty to disable announcements.
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {currentAnnouncement && currentAnnouncement.trim() !== '' ? (
              <span className="text-green-600 dark:text-green-400">✓ Active announcement</span>
            ) : (
              <span className="text-gray-500">No active announcement</span>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateAnnouncement.isPending}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateAnnouncement.isPending ? 'Saving...' : 'Save Announcement'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
