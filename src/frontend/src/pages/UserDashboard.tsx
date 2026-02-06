import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Upload, List, User, Mail, Phone, Instagram, Facebook, AlertCircle, UserPlus, BadgeCheck, Zap, Clock, TrendingUp, Headphones, IndianRupee, BookOpen } from 'lucide-react';
import { SiSpotify, SiApplemusic } from 'react-icons/si';
import SongSubmissionForm from '../components/SongSubmissionForm';
import UserSubmissionsList from '../components/UserSubmissionsList';
import ArtistSetupForm from '../components/ArtistSetupForm';
import VerifiedBadge from '../components/VerifiedBadge';
import GreenBadge from '../components/GreenBadge';
import DashboardPublishedBlogList from '../components/DashboardPublishedBlogList';
import { useGetArtistProfile, useGetDistributionFee, useGetAnnualMaintenanceFee, useGetVerificationStatus, useApplyForVerification, useIsVerificationBadgeActive } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from '@tanstack/react-router';

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('submissions');
  const { data: artistProfile, isLoading: profileLoading } = useGetArtistProfile();
  const { data: distributionFee } = useGetDistributionFee();
  const { data: annualMaintenanceFee } = useGetAnnualMaintenanceFee();
  const { data: verificationStatus } = useGetVerificationStatus();
  const { data: isBadgeActive } = useIsVerificationBadgeActive();
  const applyForVerification = useApplyForVerification();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createProfileDialogOpen, setCreateProfileDialogOpen] = useState(false);
  const navigate = useNavigate();

  const distributionFeeAmount = distributionFee ? Number(distributionFee) : 199;
  const annualMaintenanceFeeAmount = annualMaintenanceFee ? Number(annualMaintenanceFee) : 1000;

  const isWaiting = verificationStatus === 'waiting';
  const isApproved = verificationStatus === 'approved';

  const handleVerificationClick = async () => {
    if (isWaiting || isApproved) {
      // If already in waitlist or approved, navigate to verification page
      navigate({ to: '/verification-subscription' });
    } else {
      // Apply for verification
      try {
        await applyForVerification.mutateAsync();
      } catch (error) {
        console.error('Failed to apply for verification:', error);
      }
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {!profileLoading && !artistProfile && (
        <Card className="mb-4 sm:mb-8 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 border-primary/20">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <UserPlus className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Complete Your Artist Profile</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  Create your artist profile to start submitting your music
                </p>
              </div>
              <Dialog open={createProfileDialogOpen} onOpenChange={setCreateProfileDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Your Artist Profile</DialogTitle>
                  </DialogHeader>
                  <ArtistSetupForm
                    isEditing={false}
                    onSuccess={() => setCreateProfileDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {artistProfile && (
        <Card className="mb-4 sm:mb-8 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 border-primary/20">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-start">
              <img
                src={artistProfile.profilePhoto.getDirectURL()}
                alt={artistProfile.stageName}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-primary/30 mx-auto md:mx-0"
              />
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
                  <div className="w-full sm:w-auto">
                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2 flex-wrap">
                      <span className="break-all">{artistProfile.stageName}</span>
                      {isBadgeActive ? <VerifiedBadge size="large" /> : <GreenBadge size="large" />}
                    </h2>
                    <p className="text-base sm:text-lg text-muted-foreground break-words">{artistProfile.fullName}</p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleVerificationClick}
                      disabled={applyForVerification.isPending}
                      className={`flex-1 sm:flex-none text-xs sm:text-sm ${
                        isWaiting
                          ? 'bg-gradient-to-r from-orange-500/10 to-yellow-500/10 hover:from-orange-500/20 hover:to-yellow-500/20 border-orange-500/30'
                          : isApproved
                          ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 border-green-500/30'
                          : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border-blue-500/30'
                      }`}
                    >
                      <BadgeCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      {applyForVerification.isPending
                        ? 'Processing...'
                        : isWaiting
                        ? 'In Waitlist'
                        : isApproved
                        ? 'Verified'
                        : 'Verification'}
                    </Button>
                    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm">
                          <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Edit Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Artist Profile</DialogTitle>
                        </DialogHeader>
                        <ArtistSetupForm
                          initialData={artistProfile}
                          isEditing={true}
                          onSuccess={() => setEditDialogOpen(false)}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 break-all">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                    <span>{artistProfile.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                    <span>{artistProfile.mobileNumber}</span>
                  </div>
                  {artistProfile.instagramLink && (
                    <div className="flex items-center gap-2">
                      <Instagram className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                      <a
                        href={artistProfile.instagramLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate"
                      >
                        Instagram
                      </a>
                    </div>
                  )}
                  {artistProfile.facebookLink && (
                    <div className="flex items-center gap-2">
                      <Facebook className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                      <a
                        href={artistProfile.facebookLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate"
                      >
                        Facebook
                      </a>
                    </div>
                  )}
                  {artistProfile.spotifyProfile && (
                    <div className="flex items-center gap-2">
                      <SiSpotify className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                      <a
                        href={artistProfile.spotifyProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate"
                      >
                        Spotify
                      </a>
                    </div>
                  )}
                  {artistProfile.appleProfile && (
                    <div className="flex items-center gap-2">
                      <SiApplemusic className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                      <a
                        href={artistProfile.appleProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate"
                      >
                        Apple Music
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Artist Dashboard
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage your music submissions and track their status</p>
      </div>

      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
        <Alert className="border-blue-500/50 bg-blue-500/10">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
          <AlertDescription className="text-sm sm:text-base font-medium">
            Every release will be charged a distribution fee of ₹{distributionFeeAmount}
          </AlertDescription>
        </Alert>

        <Alert className="border-purple-500/50 bg-purple-500/10">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
          <AlertDescription className="text-sm sm:text-base font-medium">
            For data maintenance, ₹{annualMaintenanceFeeAmount} is charged per year
          </AlertDescription>
        </Alert>
      </div>

      {/* Verification Benefits Section */}
      <Card className="mb-4 sm:mb-6 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <BadgeCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            Verification Benefits
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Unlock premium features and accelerate your music career with verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-semibold mb-1">25% Discount on Release Fees</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Save money on every release you distribute</p>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-semibold mb-1">Faster Distribution</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Get your music live within 7 days</p>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-semibold mb-1">Quicker Approvals</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Priority review within 24–48 hours</p>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-semibold mb-1">24-Hour Contact Support</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Get dedicated support when you need it</p>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 sm:col-span-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-semibold mb-1">₹200 per Month for Verified Artists</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Exclusive monthly pricing benefit</p>
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 text-center">
            <Button
              onClick={handleVerificationClick}
              disabled={applyForVerification.isPending}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-sm sm:text-base"
            >
              <BadgeCheck className="w-4 h-4 mr-2" />
              {applyForVerification.isPending
                ? 'Processing...'
                : isWaiting
                ? 'View Verification Status'
                : isApproved
                ? 'View Verification Details'
                : 'Apply for Verification'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-3 gap-1">
          <TabsTrigger value="submissions" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <List className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">My Submissions</span>
            <span className="sm:hidden">Submissions</span>
          </TabsTrigger>
          <TabsTrigger value="submit" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Submit New</span>
            <span className="sm:hidden">Submit</span>
          </TabsTrigger>
          <TabsTrigger value="blog" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Blog</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submissions">
          <UserSubmissionsList />
        </TabsContent>

        <TabsContent value="submit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Music className="w-5 h-5 sm:w-6 sm:h-6" />
                Submit Your Music
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Fill in all the details about your track and upload your files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SongSubmissionForm onSuccess={() => setActiveTab('submissions')} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blog">
          <DashboardPublishedBlogList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
