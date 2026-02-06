import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Music, Users } from 'lucide-react';
import AdminSubmissionsList from '../components/AdminSubmissionsList';
import AdminStats from '../components/AdminStats';
import AdminArtistManagement from '../components/AdminArtistManagement';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function TeamDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Team Dashboard
        </h1>
        <p className="text-muted-foreground">Review and manage music submissions</p>
      </div>

      <Alert className="mb-6 border-blue-500/50 bg-blue-500/10">
        <Info className="h-5 w-5 text-blue-500" />
        <AlertDescription>
          You have team member access. You can review submissions, add comments, and change submission status, but cannot edit submissions, delete them, or manage artist profiles.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full max-w-3xl grid-cols-3 gap-1">
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
        </TabsList>

        <TabsContent value="overview">
          <AdminStats />
        </TabsContent>

        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle>All Submissions</CardTitle>
              <CardDescription>Review and manage music submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminSubmissionsList isTeamMember={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="artists">
          <Card>
            <CardHeader>
              <CardTitle>Artist Management</CardTitle>
              <CardDescription>View artist profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminArtistManagement isTeamMember={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
