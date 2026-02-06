import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Music, Users, Megaphone, DollarSign, BadgeCheck, UserCog, BookOpen, Settings } from 'lucide-react';
import AdminSubmissionsList from '../components/AdminSubmissionsList';
import AdminStats from '../components/AdminStats';
import AdminTeamManagement from '../components/AdminTeamManagement';
import AdminArtistManagement from '../components/AdminArtistManagement';
import AdminAnnouncementSection from '../components/AdminAnnouncementSection';
import AdminFeeManagement from '../components/AdminFeeManagement';
import AdminVerificationManagement from '../components/AdminVerificationManagement';
import AdminUserRoleManagement from '../components/AdminUserRoleManagement';
import AdminBlogManagement from '../components/AdminBlogManagement';
import AdminProfileEditingControl from '../components/AdminProfileEditingControl';

export default function AdminDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">Manage submissions, artists, fees, verification, blog, and team members</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full max-w-6xl grid-cols-10 gap-1">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="submissions" className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            <span className="hidden sm:inline">Submissions</span>
          </TabsTrigger>
          <TabsTrigger value="artists" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Artists</span>
          </TabsTrigger>
          <TabsTrigger value="verification" className="flex items-center gap-2">
            <BadgeCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Verification</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <UserCog className="w-4 h-4" />
            <span className="hidden sm:inline">Roles</span>
          </TabsTrigger>
          <TabsTrigger value="fees" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Fees</span>
          </TabsTrigger>
          <TabsTrigger value="announcement" className="flex items-center gap-2">
            <Megaphone className="w-4 h-4" />
            <span className="hidden sm:inline">Announcement</span>
          </TabsTrigger>
          <TabsTrigger value="blog" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Blog</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Team</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AdminStats />
        </TabsContent>

        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle>All Submissions</CardTitle>
              <CardDescription>Review, approve, or reject music submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminSubmissionsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="artists">
          <Card>
            <CardHeader>
              <CardTitle>Artist Management</CardTitle>
              <CardDescription>View and manage artist profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminArtistManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification">
          <Card>
            <CardHeader>
              <CardTitle>Verification Management</CardTitle>
              <CardDescription>Review and manage artist verification requests</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminVerificationManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>User Role Management</CardTitle>
              <CardDescription>Upgrade users to team members or downgrade team members to regular users</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminUserRoleManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees">
          <AdminFeeManagement />
        </TabsContent>

        <TabsContent value="announcement">
          <AdminAnnouncementSection />
        </TabsContent>

        <TabsContent value="blog">
          <Card>
            <CardHeader>
              <CardTitle>Blog Management</CardTitle>
              <CardDescription>Create, edit, and publish blog posts</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminBlogManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>Invite team members to help manage submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminTeamManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>Configure platform-wide settings and access controls</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminProfileEditingControl />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
