import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Megaphone, X } from 'lucide-react';
import { useGetAnnouncement } from '../hooks/useQueries';

const ANNOUNCEMENT_STORAGE_KEY = 'lastSeenAnnouncement';

export default function AnnouncementPopup() {
  const { data: announcement, isLoading } = useGetAnnouncement();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && announcement && announcement.trim() !== '') {
      // Check if user has seen this announcement in this session
      const lastSeen = sessionStorage.getItem(ANNOUNCEMENT_STORAGE_KEY);
      
      if (lastSeen !== announcement) {
        // Show popup if announcement is new or different
        setIsOpen(true);
      }
    }
  }, [announcement, isLoading]);

  const handleClose = () => {
    if (announcement) {
      // Store the announcement in session storage so it doesn't show again until next login
      sessionStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, announcement);
    }
    setIsOpen(false);
  };

  if (isLoading || !announcement || announcement.trim() === '') {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-2xl">Announcement</DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Important announcement from the admin
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-base leading-relaxed whitespace-pre-wrap">{announcement}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button onClick={handleClose} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
