import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminArtistManagement from '../components/AdminArtistManagement';
import AdminSubmissionsList from '../components/AdminSubmissionsList';
import AdminPodcastSubmissions from '../components/AdminPodcastSubmissions';
import AdminVerificationList from '../components/AdminVerificationList';
import AdminMonthlyListenersManagement from '../components/AdminMonthlyListenersManagement';
import AdminUserManagement from '../components/AdminUserManagement';
import AdminSubscriptionPlansManagement from '../components/AdminSubscriptionPlansManagement';
import AdminVideoSubmissions from '../components/AdminVideoSubmissions';

export default function AdminDashboard() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <Tabs defaultValue="artists" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-8 mb-6">
          <TabsTrigger value="artists">Artists</TabsTrigger>
          <TabsTrigger value="songs">Song Submissions</TabsTrigger>
          <TabsTrigger value="podcasts">Podcast Submission</TabsTrigger>
          <TabsTrigger value="videos">Video Submissions</TabsTrigger>
          <TabsTrigger value="verification">Verification List</TabsTrigger>
          <TabsTrigger value="listeners">Monthly Listeners</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="artists">
          <AdminArtistManagement />
        </TabsContent>

        <TabsContent value="songs">
          <AdminSubmissionsList />
        </TabsContent>

        <TabsContent value="podcasts">
          <AdminPodcastSubmissions />
        </TabsContent>

        <TabsContent value="videos">
          <AdminVideoSubmissions />
        </TabsContent>

        <TabsContent value="verification">
          <AdminVerificationList />
        </TabsContent>

        <TabsContent value="listeners">
          <AdminMonthlyListenersManagement />
        </TabsContent>

        <TabsContent value="users">
          <AdminUserManagement />
        </TabsContent>

        <TabsContent value="plans">
          <AdminSubscriptionPlansManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
