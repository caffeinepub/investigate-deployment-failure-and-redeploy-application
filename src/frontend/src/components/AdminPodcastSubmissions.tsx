import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Download, Loader2, Music, Video, Image as ImageIcon, FileAudio, FileVideo } from 'lucide-react';
import { useGetAllPodcasts, useGetAllEpisodes } from '../hooks/useQueries';
import { downloadExternalBlob } from '../utils/downloadExternalBlob';
import { toast } from 'sonner';

export default function AdminPodcastSubmissions() {
  const { data: podcasts, isLoading: podcastsLoading } = useGetAllPodcasts();
  const { data: episodes, isLoading: episodesLoading } = useGetAllEpisodes();
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());

  const handleDownload = async (
    blob: { getBytes: () => Promise<Uint8Array> },
    filename: string,
    fileId: string
  ) => {
    setDownloadingFiles((prev) => new Set(prev).add(fileId));
    try {
      await downloadExternalBlob(blob, filename);
      toast.success(`Downloaded ${filename}`);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download file');
    } finally {
      setDownloadingFiles((prev) => {
        const next = new Set(prev);
        next.delete(fileId);
        return next;
      });
    }
  };

  const getEpisodesForShow = (showId: string) => {
    return episodes?.filter((ep) => ep.showId === showId) || [];
  };

  if (podcastsLoading || episodesLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <p className="text-muted-foreground">Loading podcast submissions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!podcasts || podcasts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No podcast submissions yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Podcast Submissions</CardTitle>
          <CardDescription>
            View and manage all podcast shows and episodes submitted by users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {podcasts.map((show) => {
              const showEpisodes = getEpisodesForShow(show.id);
              return (
                <AccordionItem key={show.id} value={show.id}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-4 flex-1 text-left">
                      <img
                        src={show.artwork.getDirectURL()}
                        alt={show.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{show.title}</h3>
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
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {showEpisodes.length} episode{showEpisodes.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Description</p>
                          <p className="text-sm text-muted-foreground">{show.description}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Category</p>
                          <p className="text-sm text-muted-foreground">{show.category}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Language</p>
                          <p className="text-sm text-muted-foreground">{show.language}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Created By</p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {show.createdBy.toString().slice(0, 20)}...
                          </p>
                        </div>
                      </div>

                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDownload(
                              show.artwork,
                              `${show.title}-artwork.jpg`,
                              `show-artwork-${show.id}`
                            )
                          }
                          disabled={downloadingFiles.has(`show-artwork-${show.id}`)}
                        >
                          {downloadingFiles.has(`show-artwork-${show.id}`) ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4 mr-2" />
                          )}
                          Download Artwork
                        </Button>
                      </div>

                      {showEpisodes.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-semibold">Episodes</h4>
                          {showEpisodes.map((episode) => (
                            <Card key={episode.id}>
                              <CardContent className="pt-4">
                                <div className="flex items-start gap-4">
                                  <img
                                    src={episode.thumbnail.getDirectURL()}
                                    alt={episode.title}
                                    className="w-20 h-20 rounded object-cover"
                                  />
                                  <div className="flex-1 space-y-3">
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <h5 className="font-medium">{episode.title}</h5>
                                        <Badge variant="secondary" className="text-xs">
                                          S{episode.seasonNumber.toString()} E{episode.episodeNumber.toString()}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                          {episode.episodeType}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground">
                                        {episode.description}
                                      </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                      {episode.isEighteenPlus && (
                                        <Badge variant="destructive" className="text-xs">18+</Badge>
                                      )}
                                      {episode.isExplicit && (
                                        <Badge variant="secondary" className="text-xs">Explicit</Badge>
                                      )}
                                      {episode.isPromotional && (
                                        <Badge variant="outline" className="text-xs">Promotional</Badge>
                                      )}
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleDownload(
                                            episode.artwork,
                                            `${episode.title}-artwork.jpg`,
                                            `episode-artwork-${episode.id}`
                                          )
                                        }
                                        disabled={downloadingFiles.has(`episode-artwork-${episode.id}`)}
                                      >
                                        {downloadingFiles.has(`episode-artwork-${episode.id}`) ? (
                                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                          <ImageIcon className="w-4 h-4 mr-2" />
                                        )}
                                        Artwork
                                      </Button>

                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleDownload(
                                            episode.thumbnail,
                                            `${episode.title}-thumbnail.jpg`,
                                            `episode-thumbnail-${episode.id}`
                                          )
                                        }
                                        disabled={downloadingFiles.has(`episode-thumbnail-${episode.id}`)}
                                      >
                                        {downloadingFiles.has(`episode-thumbnail-${episode.id}`) ? (
                                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                          <ImageIcon className="w-4 h-4 mr-2" />
                                        )}
                                        Thumbnail
                                      </Button>

                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleDownload(
                                            episode.mediaFile,
                                            `${episode.title}-media.${show.podcastType === 'audio' ? 'mp3' : 'mp4'}`,
                                            `episode-media-${episode.id}`
                                          )
                                        }
                                        disabled={downloadingFiles.has(`episode-media-${episode.id}`)}
                                      >
                                        {downloadingFiles.has(`episode-media-${episode.id}`) ? (
                                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : show.podcastType === 'audio' ? (
                                          <FileAudio className="w-4 h-4 mr-2" />
                                        ) : (
                                          <FileVideo className="w-4 h-4 mr-2" />
                                        )}
                                        Media File
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
