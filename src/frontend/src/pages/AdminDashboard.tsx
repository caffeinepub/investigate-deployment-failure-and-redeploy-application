import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Music } from 'lucide-react';
import AdminArtistManagement from '../components/AdminArtistManagement';
import AdminSubmissionsList from '../components/AdminSubmissionsList';
import { useIsCurrentUserAdmin } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('artists');
  const { data: isAdmin, isLoading: isAdminLoading, isFetched: isAdminFetched } = useIsCurrentUserAdmin();
  const navigate = useNavigate();

  // Admin guard: redirect non-admin users
  useEffect(() => {
    if (isAdminFetched && !isAdminLoading && isAdmin === false) {
      toast.error('You are not authorized to access the admin dashboard');
      navigate({ to: '/user-dashboard' });
    }
  }, [isAdmin, isAdminFetched, isAdminLoading, navigate]);

  // Show loading state while checking admin status
  if (isAdminLoading || !isAdminFetched) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render admin content if not admin (will redirect via useEffect)
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">Admin Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 gap-1">
          <TabsTrigger value="artists" className="text-xs sm:text-sm">
            <Users className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span>Artist Profiles</span>
          </TabsTrigger>
          <TabsTrigger value="submissions" className="text-xs sm:text-sm">
            <Music className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span>Submissions</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="artists">
          <AdminArtistManagement />
        </TabsContent>

        <TabsContent value="submissions">
          <AdminSubmissionsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
