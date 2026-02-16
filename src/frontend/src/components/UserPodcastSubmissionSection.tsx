import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGetMyPodcastShows, useGetMyEpisodes } from '../hooks/useQueries';
import PodcastShowForm from './PodcastShowForm';
import PodcastEpisodeForm from './PodcastEpisodeForm';
import { PodcastShow, PodcastEpisode, PodcastModerationStatus } from '../backend';
import { Loader2, Radio, ExternalLink } from 'lucide-react';

export default function UserPodcastSubmissionSection() {
  const [activeTab, setActiveTab] = useState('shows');
  const [selectedShow, setSelectedShow] = useState<PodcastShow | null>(null);
  const [showEpisodes, setShowEpisodes] = useState<PodcastEpisode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  const { data: shows = [], isLoading: showsLoading } = useGetMyPodcastShows();
  const getEpisodesMutation = useGetMyEpisodes();

  const getStatusBadge = (status: PodcastModerationStatus) => {
    const statusMap = {
      pending: { label: 'Pending', variant: 'secondary' as const },
      approved: { label: 'Approved', variant: 'default' as const },
      rejected: { label: 'Rejected', variant: 'destructive' as const },
      live: { label: 'Live', variant: 'default' as const },
    };

    const statusKey = Object.keys(status)[0] as keyof typeof statusMap;
    const { label, variant } = statusMap[statusKey] || { label: 'Unknown', variant: 'secondary' as const };

    return <Badge variant={variant}>{label}</Badge>;
  };

  const handleShowClick = async (show: PodcastShow) => {
    setSelectedShow(show);
    setLoadingEpisodes(true);
    try {
      const episodes = await getEpisodesMutation.mutateAsync(show.id);
      setShowEpisodes(episodes);
    } catch (error) {
      console.error('Failed to load episodes:', error);
      setShowEpisodes([]);
    } finally {
      setLoadingEpisodes(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="shows">My Shows</TabsTrigger>
          <TabsTrigger value="create-show">Create Show</TabsTrigger>
          <TabsTrigger value="add-episode">Add Episode</TabsTrigger>
        </TabsList>

        <TabsContent value="shows" className="space-y-4">
          {showsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : shows.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No podcast shows yet. Create your first show to get started!
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {shows.map((show) => (
                <Card key={show.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleShowClick(show)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <Radio className="h-5 w-5" />
                          {show.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-2">{show.description}</p>
                      </div>
                      <div className="ml-4">{getStatusBadge(show.moderationStatus)}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Type: {Object.keys(show.podcastType)[0]}</span>
                      <span>Category: {Object.keys(show.category)[0]}</span>
                      <span>Language: {Object.keys(show.language)[0]}</span>
                    </div>
                    {show.liveLink && (
                      <Button variant="link" className="mt-2 p-0 h-auto" asChild>
                        <a href={show.liveLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Live
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {selectedShow && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Episodes for: {selectedShow.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingEpisodes ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : showEpisodes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No episodes yet for this show.</p>
                ) : (
                  <div className="space-y-3">
                    {showEpisodes.map((episode) => (
                      <div key={episode.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">
                            S{episode.seasonNumber.toString()} E{episode.episodeNumber.toString()}: {episode.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">{episode.description}</p>
                        </div>
                        <div className="ml-4">{getStatusBadge(episode.moderationStatus)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="create-show">
          <PodcastShowForm />
        </TabsContent>

        <TabsContent value="add-episode">
          <PodcastEpisodeForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
