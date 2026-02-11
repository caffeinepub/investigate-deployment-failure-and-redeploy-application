import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus, AlertCircle } from 'lucide-react';
import UserArtistProfilesManager from '../components/UserArtistProfilesManager';
import { useGetMyArtistProfiles } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('profiles');
  const { data: artistProfiles, isLoading: profilesLoading } = useGetMyArtistProfiles();

  const hasProfiles = artistProfiles && artistProfiles.length > 0;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-1 gap-1">
          <TabsTrigger value="profiles" className="text-xs sm:text-sm">
            <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span>Artist Profiles</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profiles">
          <UserArtistProfilesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
