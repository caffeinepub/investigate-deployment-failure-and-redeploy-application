import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Music, List, Radio } from 'lucide-react';
import UserArtistProfilesManager from '../components/UserArtistProfilesManager';
import SongSubmissionForm from '../components/SongSubmissionForm';
import UserSubmissionsList from '../components/UserSubmissionsList';
import UserPodcastSubmissionSection from '../components/UserPodcastSubmissionSection';
import VerificationBenefitsSection from '../components/VerificationBenefitsSection';
import VerificationRenewalSection from '../components/VerificationRenewalSection';

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('profiles');

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="mb-6 space-y-4">
        <VerificationRenewalSection />
        <VerificationBenefitsSection />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-4 gap-1">
          <TabsTrigger value="profiles" className="text-xs sm:text-sm">
            <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Artist Profiles</span>
            <span className="sm:hidden">Profiles</span>
          </TabsTrigger>
          <TabsTrigger value="submit" className="text-xs sm:text-sm">
            <Music className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Submit Song</span>
            <span className="sm:hidden">Submit</span>
          </TabsTrigger>
          <TabsTrigger value="submissions" className="text-xs sm:text-sm">
            <List className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">My Submissions</span>
            <span className="sm:hidden">My Songs</span>
          </TabsTrigger>
          <TabsTrigger value="podcast" className="text-xs sm:text-sm">
            <Radio className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Podcast</span>
            <span className="sm:hidden">Podcast</span>
          </TabsTrigger>
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
      </Tabs>
    </div>
  );
}
