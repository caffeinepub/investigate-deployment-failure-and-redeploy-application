import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserArtistProfilesManager from '../components/UserArtistProfilesManager';
import SongSubmissionForm from '../components/SongSubmissionForm';
import UserSubmissionsList from '../components/UserSubmissionsList';
import UserPodcastSubmissionSection from '../components/UserPodcastSubmissionSection';
import UserAnalysisPanel from '../components/UserAnalysisPanel';
import VideoSubmissionForm from '../components/VideoSubmissionForm';
import UserVideoSubmissionSection from '../components/UserVideoSubmissionSection';

export default function UserDashboard() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>

      <Tabs defaultValue="profiles" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 mb-6">
          <TabsTrigger value="profiles">Artist Profiles</TabsTrigger>
          <TabsTrigger value="submit">Submit Song</TabsTrigger>
          <TabsTrigger value="submissions">My Submissions</TabsTrigger>
          <TabsTrigger value="podcast">Podcast</TabsTrigger>
          <TabsTrigger value="video">Video Submissions</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles">
          <UserArtistProfilesManager />
        </TabsContent>

        <TabsContent value="submit">
          <SongSubmissionForm />
        </TabsContent>

        <TabsContent value="submissions">
          <UserSubmissionsList />
        </TabsContent>

        <TabsContent value="podcast">
          <UserPodcastSubmissionSection />
        </TabsContent>

        <TabsContent value="video">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Submit New Video</h2>
              <VideoSubmissionForm />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4">My Video Submissions</h2>
              <UserVideoSubmissionSection />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analysis">
          <UserAnalysisPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
