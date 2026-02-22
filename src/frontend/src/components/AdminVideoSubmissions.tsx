import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  useGetAllVideoSubmissions,
  useUpdateVideoStatus,
  useDeleteVideoSubmission,
  useDownloadVideoFile,
  useGetAllArtistProfiles,
} from '../hooks/useQueries';
import { VideoSubmission, VideoSubmissionStatus } from '../backend';
import { Loader2, Download, Edit, Trash2 } from 'lucide-react';
import { downloadExternalBlob } from '../utils/downloadExternalBlob';
import { toast } from 'sonner';
import AdminEditVideoDialog from './AdminEditVideoDialog';

export default function AdminVideoSubmissions() {
  const { data: videos, isLoading } = useGetAllVideoSubmissions();
  const { data: artistProfiles } = useGetAllArtistProfiles();
  const updateStatus = useUpdateVideoStatus();
  const deleteVideo = useDeleteVideoSubmission();
  const downloadVideo = useDownloadVideoFile();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [liveUrls, setLiveUrls] = useState<Record<string, string>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoSubmission | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const getUserFullName = (userId: string): string => {
    if (!artistProfiles) return 'Unknown User';
    const profile = artistProfiles.find((p) => p.owner.toString() === userId);
    return profile ? profile.fullName : 'Unknown User';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-blue-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'waiting':
        return <Badge className="bg-yellow-500">Waiting</Badge>;
      case 'live':
        return <Badge className="bg-green-500">Live</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleStatusChange = async (videoId: string, newStatus: VideoSubmissionStatus) => {
    if (newStatus === 'live') {
      const liveUrl = liveUrls[videoId];
      if (!liveUrl || !liveUrl.trim()) {
        toast.error('Please enter a live URL before setting status to live');
        return;
      }
      await updateStatus.mutateAsync({ videoId, status: newStatus, liveUrl });
    } else {
      await updateStatus.mutateAsync({ videoId, status: newStatus, liveUrl: null });
    }
  };

  const handleDownload = async (videoId: string, title: string) => {
    try {
      const blob = await downloadVideo.mutateAsync(videoId);
      await downloadExternalBlob(blob, `${title}.mp4`);
      toast.success('Video download started');
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error(error.message || 'Failed to download video');
    }
  };

  const handleDeleteClick = (videoId: string) => {
    setVideoToDelete(videoId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (videoToDelete) {
      await deleteVideo.mutateAsync(videoToDelete);
      setDeleteDialogOpen(false);
      setVideoToDelete(null);
    }
  };

  const handleEdit = (video: VideoSubmission) => {
    setEditingVideo(video);
    setEditDialogOpen(true);
  };

  const filteredVideos = videos?.filter((video) => {
    if (statusFilter === 'all') return true;
    return video.status === statusFilter;
  });

  // Sort videos: Pro users first (when backend verification is available)
  const sortedVideos = filteredVideos?.sort((a, b) => {
    // For now, sort by submission date (newest first)
    return Number(b.submittedAt - a.submittedAt);
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Filter by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="live">Live</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Video List */}
        {!sortedVideos || sortedVideos.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">
                No video submissions found.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedVideos.map((video) => (
              <Card key={video.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{video.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Submitted by {getUserFullName(video.userId.toString())} on{' '}
                        {new Date(Number(video.submittedAt / BigInt(1000000))).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(video.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Thumbnail Preview */}
                    <div>
                      <img
                        src={video.thumbnail.getDirectURL()}
                        alt={video.title}
                        className="w-full max-w-md h-48 object-cover rounded-lg"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <p className="text-sm font-medium">Description:</p>
                      <p className="text-sm text-muted-foreground">{video.description}</p>
                    </div>

                    {/* Category */}
                    <div>
                      <p className="text-sm font-medium">Category:</p>
                      <p className="text-sm text-muted-foreground">{video.category}</p>
                    </div>

                    {/* Tags */}
                    {video.tags.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Tags:</p>
                        <div className="flex flex-wrap gap-2">
                          {video.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status Change */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Change Status</Label>
                        <Select
                          value={video.status}
                          onValueChange={(value) =>
                            handleStatusChange(video.id, value as VideoSubmissionStatus)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="waiting">Waiting</SelectItem>
                            <SelectItem value="live">Live</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Live URL Input */}
                      <div>
                        <Label htmlFor={`live-url-${video.id}`}>Live URL</Label>
                        <Input
                          id={`live-url-${video.id}`}
                          value={liveUrls[video.id] || video.liveUrl || ''}
                          onChange={(e) =>
                            setLiveUrls({ ...liveUrls, [video.id]: e.target.value })
                          }
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(video)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(video.id, video.title)}
                        disabled={downloadVideo.isPending}
                      >
                        {downloadVideo.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 mr-2" />
                        )}
                        Download Video
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(video.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the video submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <AdminEditVideoDialog
        video={editingVideo}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </>
  );
}
