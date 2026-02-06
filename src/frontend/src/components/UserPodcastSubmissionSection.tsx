import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Mic, Plus, Video, Music } from 'lucide-react';
import { useGetPodcastEpisodesByUser } from '../hooks/useQueries';
import PodcastShowForm from './PodcastShowForm';
import PodcastEpisodeForm from './PodcastEpisodeForm';

export default function UserPodcastSubmissionSection() {
  const { data: showsWithEpisodes, isLoading } = useGetPodcastEpisodesByUser();
  const [selectedShowId, setSelectedShowId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'shows' | 'create-show' | 'add-episode'>('shows');

  const handleShowCreated = () => {
    setActiveTab('shows');
  };

  const handleEpisodeCreated = () => {
    setActiveTab('shows');
    setSelectedShowId(null);
  };

  const handleAddEpisode = (showId: string) => {
    setSelectedShowId(showId);
    setActiveTab('add-episode');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading your podcast shows...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="shows">My Shows</TabsTrigger>
          <TabsTrigger value="create-show">Create Show</TabsTrigger>
          <TabsTrigger value="add-episode" disabled={!selectedShowId}>
            Add Episode
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shows" className="space-y-4">
          {!showsWithEpisodes || showsWithEpisodes.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Mic className="w-16 h-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">No Podcast Shows Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first podcast show to start uploading episodes
                    </p>
                    <Button onClick={() => setActiveTab('create-show')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Show
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Your Podcast Shows</h3>
                <Button onClick={() => setActiveTab('create-show')} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Show
                </Button>
              </div>

              {showsWithEpisodes.map(([show, episodes]) => (
                <Card key={show.id}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <img
                        src={show.artwork.getDirectURL()}
                        alt={show.title}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {show.title}
                              <Badge variant="outline">
                                {show.podcastType === 'audio' ? (
                                  <>
                                    <Music className="w-3 h-3 mr-1" />
                                    Audio
                                  </>
                                ) : (
                                  <>
                                    <Video className="w-3 h-3 mr-1" />
                                    Video
                                  </>
                                )}
                              </Badge>
                            </CardTitle>
                            <CardDescription className="mt-2">{show.description}</CardDescription>
                          </div>
                          <Button onClick={() => handleAddEpisode(show.id)} size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Episode
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">
                        Episodes ({episodes.length})
                      </h4>
                      {episodes.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No episodes yet</p>
                      ) : (
                        <div className="space-y-2">
                          {episodes.map((episode) => (
                            <div
                              key={episode.id}
                              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                            >
                              <img
                                src={episode.thumbnail.getDirectURL()}
                                alt={episode.title}
                                className="w-12 h-12 rounded object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{episode.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  S{episode.seasonNumber.toString()} E{episode.episodeNumber.toString()} • {episode.episodeType}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                {episode.isEighteenPlus && (
                                  <Badge variant="destructive" className="text-xs">18+</Badge>
                                )}
                                {episode.isExplicit && (
                                  <Badge variant="secondary" className="text-xs">Explicit</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create-show">
          <PodcastShowForm onSuccess={handleShowCreated} />
        </TabsContent>

        <TabsContent value="add-episode">
          {selectedShowId ? (
            <PodcastEpisodeForm showId={selectedShowId} onSuccess={handleEpisodeCreated} />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Please select a show from the "My Shows" tab first
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
