import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, Music, Radio, BadgeCheck } from 'lucide-react';
import AdminArtistManagement from '../components/AdminArtistManagement';
import AdminSubmissionsList from '../components/AdminSubmissionsList';
import AdminPodcastSubmissions from '../components/AdminPodcastSubmissions';
import AdminVerificationList from '../components/AdminVerificationList';
import { useIsCurrentUserAdmin, useGetVerificationRequestsForAdmin } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('artists');
  const { data: isAdmin, isLoading: isAdminLoading, isFetched: isAdminFetched } = useIsCurrentUserAdmin();
  const { data: verificationRequests } = useGetVerificationRequestsForAdmin();
  const navigate = useNavigate();

  const pendingVerificationCount = verificationRequests?.filter((r) => r.status === 'pending').length || 0;

  // Admin guard: redirect non-admin users only after fresh check completes
  useEffect(() => {
    if (isAdminFetched && !isAdminLoading && isAdmin === false) {
      toast.error('You are not authorized to access the admin dashboard');
      navigate({ to: '/user-dashboard' });
    }
  }, [isAdmin, isAdminFetched, isAdminLoading, navigate]);

  // Show loading state while checking admin status
  if (isAdminLoading || !isAdminFetched) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Only render admin content if confirmed admin
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="artists" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Artist Profiles
          </TabsTrigger>
          <TabsTrigger value="submissions" className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            Song Submissions
          </TabsTrigger>
          <TabsTrigger value="podcasts" className="flex items-center gap-2">
            <Radio className="w-4 h-4" />
            Podcast Submission
          </TabsTrigger>
          <TabsTrigger value="verification" className="flex items-center gap-2 relative">
            <BadgeCheck className="w-4 h-4" />
            Verification List
            {pendingVerificationCount > 0 && (
              <Badge className="ml-2 bg-orange-600 text-white text-xs px-1.5 py-0">
                {pendingVerificationCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="artists">
          <AdminArtistManagement />
        </TabsContent>

        <TabsContent value="submissions">
          <AdminSubmissionsList />
        </TabsContent>

        <TabsContent value="podcasts">
          <AdminPodcastSubmissions />
        </TabsContent>

        <TabsContent value="verification">
          <AdminVerificationList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
