import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Settings, DollarSign, Megaphone, BookOpen, UserCog, Mic } from 'lucide-react';
import AdminStats from '../components/AdminStats';
import AdminSubmissionsList from '../components/AdminSubmissionsList';
import AdminArtistManagement from '../components/AdminArtistManagement';
import AdminVerificationManagement from '../components/AdminVerificationManagement';
import AdminUserRoleManagement from '../components/AdminUserRoleManagement';
import AdminFeeManagement from '../components/AdminFeeManagement';
import AdminAnnouncementSection from '../components/AdminAnnouncementSection';
import AdminBlogManagement from '../components/AdminBlogManagement';
import AdminTeamManagement from '../components/AdminTeamManagement';
import AdminProfileEditingControl from '../components/AdminProfileEditingControl';
import AdminPodcastSubmissions from '../components/AdminPodcastSubmissions';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Manage submissions, artists, and platform settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 h-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="submissions" className="text-xs sm:text-sm">
            <Users className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Submissions</span>
          </TabsTrigger>
          <TabsTrigger value="artists" className="text-xs sm:text-sm">
            <Users className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Artists</span>
          </TabsTrigger>
          <TabsTrigger value="verification" className="text-xs sm:text-sm">
            <Settings className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Verification</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="text-xs sm:text-sm">
            <UserCog className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">User Roles</span>
          </TabsTrigger>
          <TabsTrigger value="fees" className="text-xs sm:text-sm">
            <DollarSign className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Fees</span>
          </TabsTrigger>
          <TabsTrigger value="announcement" className="text-xs sm:text-sm">
            <Megaphone className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Announcement</span>
          </TabsTrigger>
          <TabsTrigger value="blog" className="text-xs sm:text-sm">
            <BookOpen className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Blog</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="text-xs sm:text-sm">
            <Users className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Team</span>
          </TabsTrigger>
          <TabsTrigger value="podcasts" className="text-xs sm:text-sm">
            <Mic className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Podcasts</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            <AdminStats />
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure platform-wide settings</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminProfileEditingControl />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="submissions">
          <AdminSubmissionsList />
        </TabsContent>

        <TabsContent value="artists">
          <AdminArtistManagement />
        </TabsContent>

        <TabsContent value="verification">
          <AdminVerificationManagement />
        </TabsContent>

        <TabsContent value="roles">
          <AdminUserRoleManagement />
        </TabsContent>

        <TabsContent value="fees">
          <AdminFeeManagement />
        </TabsContent>

        <TabsContent value="announcement">
          <AdminAnnouncementSection />
        </TabsContent>

        <TabsContent value="blog">
          <AdminBlogManagement />
        </TabsContent>

        <TabsContent value="team">
          <AdminTeamManagement />
        </TabsContent>

        <TabsContent value="podcasts">
          <AdminPodcastSubmissions />
        </TabsContent>
      </Tabs>
    </div>
  );
}
