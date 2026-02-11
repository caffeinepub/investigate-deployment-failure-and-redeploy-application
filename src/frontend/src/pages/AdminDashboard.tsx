import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users } from 'lucide-react';
import AdminArtistManagement from '../components/AdminArtistManagement';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('artists');

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">Admin Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-1 gap-1">
          <TabsTrigger value="artists" className="text-xs sm:text-sm">
            <Users className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span>Artist Profiles</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="artists">
          <AdminArtistManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
