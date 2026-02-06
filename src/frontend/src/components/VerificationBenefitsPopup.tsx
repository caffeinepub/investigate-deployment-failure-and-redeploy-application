import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BadgeCheck, Zap, Clock, TrendingUp, Headphones, IndianRupee } from 'lucide-react';
import { useIsVerificationBadgeActive } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';

const VERIFICATION_BENEFITS_STORAGE_KEY = 'verificationBenefitsPopupSeen';

export default function VerificationBenefitsPopup() {
  const { data: isBadgeActive, isLoading } = useIsVerificationBadgeActive();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isBadgeActive === false) {
      // Only show to unverified users
      const hasSeenPopup = sessionStorage.getItem(VERIFICATION_BENEFITS_STORAGE_KEY);
      
      if (!hasSeenPopup) {
        // Show popup once per session
        setIsOpen(true);
      }
    }
  }, [isBadgeActive, isLoading]);

  const handleOpenChange = (open: boolean) => {
    // Only mark as seen when closing (open === false)
    if (!open) {
      sessionStorage.setItem(VERIFICATION_BENEFITS_STORAGE_KEY, 'true');
      setIsOpen(false);
    }
  };

  const handleClose = () => {
    // Mark as seen for this session
    sessionStorage.setItem(VERIFICATION_BENEFITS_STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  const handleApply = () => {
    handleClose();
    navigate({ to: '/verification-subscription' });
  };

  if (isLoading || isBadgeActive === true) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] md:max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <BadgeCheck className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-2xl">Get Verified & Unlock Premium Benefits!</DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Verification benefits and application information
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
          <p className="text-muted-foreground">
            Become a verified artist and enjoy exclusive benefits designed to accelerate your music career:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">25% Discount on Release Fees</h4>
                <p className="text-sm text-muted-foreground">Save money on every release you distribute</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Faster Distribution</h4>
                <p className="text-sm text-muted-foreground">Get your music live within 7 days</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Quicker Approvals</h4>
                <p className="text-sm text-muted-foreground">Priority review within 24–48 hours</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <Headphones className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">24-Hour Contact Support</h4>
                <p className="text-sm text-muted-foreground">Get dedicated support when you need it</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <IndianRupee className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">₹200 per Month for Verified Artists</h4>
                <p className="text-sm text-muted-foreground">Exclusive monthly pricing benefit</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-center text-muted-foreground mb-4">
              Ready to take your music career to the next level?
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t flex-shrink-0 bg-background">
          <Button variant="outline" onClick={handleClose}>
            Maybe Later
          </Button>
          <Button 
            onClick={handleApply}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <BadgeCheck className="w-4 h-4 mr-2" />
            Apply for Verification
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
