import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  useGetAllSubmissionsForAdmin,
  useAdminUpdateSubmission,
  useAdminDeleteSubmission,
  useAdminSetSubmissionLive,
  useGetVerifiedArtistStatus,
} from '../hooks/useQueries';
import { Loader2, Download, Trash2, Edit, ExternalLink } from 'lucide-react';
import { SongStatus, SongSubmission } from '../backend';
import { downloadExternalBlob } from '../utils/downloadExternalBlob';
import { isValidUrl } from '../utils/isValidUrl';
import { toast } from 'sonner';
import AdminEditSubmissionDialog from './AdminEditSubmissionDialog';
import VerifiedBadge from './VerifiedBadge';

export default function AdminSubmissionsList() {
  const { data: submissions, isLoading } = useGetAllSubmissionsForAdmin();
  const updateSubmission = useAdminUpdateSubmission();
  const deleteSubmission = useAdminDeleteSubmission();
  const setSubmissionLive = useAdminSetSubmissionLive();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<{ [key: string]: SongStatus }>({});
  const [editingRemarks, setEditingRemarks] = useState<{ [key: string]: string }>({});
  const [editingComments, setEditingComments] = useState<{ [key: string]: string }>({});
  const [liveUrls, setLiveUrls] = useState<{ [key: string]: string }>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editDialogSubmission, setEditDialogSubmission] = useState<SongSubmission | null>(null);

  // Sort submissions: Pro users first, then regular users
  // Within each group, maintain stable order (by timestamp descending)
  const sortedSubmissions = useMemo(() => {
    if (!submissions) return [];
    
    // For now, we cannot determine Pro status from backend
    // Backend gap: Need a way to check if submitter is verified
    // Placeholder: sort by timestamp only
    return [...submissions].sort((a, b) => {
      return Number(b.timestamp - a.timestamp);
    });
  }, [submissions]);

  const getStatusBadge = (status: SongStatus) => {
    switch (status) {
      case SongStatus.pending:
        return <Badge variant="secondary">Pending</Badge>;
      case SongStatus.approved:
        return <Badge className="bg-green-600">Approved</Badge>;
      case SongStatus.rejected:
        return <Badge variant="destructive">Rejected</Badge>;
      case SongStatus.draft:
        return <Badge variant="outline">Draft</Badge>;
      case SongStatus.live:
        return <Badge className="bg-blue-600">Live</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleStatusChange = (id: string, status: SongStatus) => {
    setEditingStatus((prev) => ({ ...prev, [id]: status }));
  };

  const handleSave = async (submission: SongSubmission) => {
    const status = editingStatus[submission.id] || submission.status;
    const remarks = editingRemarks[submission.id] || submission.adminRemarks;
    const comment = editingComments[submission.id] || submission.adminComment;

    if (status === SongStatus.live) {
      const liveUrl = liveUrls[submission.id];
      if (!liveUrl || !liveUrl.trim()) {
        toast.error('Live URL is required when setting status to Live');
        return;
      }
      if (!isValidUrl(liveUrl)) {
        toast.error('Live URL must start with http:// or https://');
        return;
      }

      try {
        await setSubmissionLive.mutateAsync({
          id: submission.id,
          liveUrl,
          adminRemarks: remarks,
          adminComment: comment,
        });
        setLiveUrls((prev) => {
          const updated = { ...prev };
          delete updated[submission.id];
          return updated;
        });
        setEditingId(null);
      } catch (error: any) {
        console.error('Set live error:', error);
      }
    } else {
      try {
        await updateSubmission.mutateAsync({
          id: submission.id,
          status,
          adminRemarks: remarks,
          adminComment: comment,
        });
        setEditingId(null);
      } catch (error: any) {
        console.error('Update error:', error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSubmission.mutateAsync(id);
      setDeleteConfirmId(null);
    } catch (error: any) {
      console.error('Delete error:', error);
    }
  };

  const handleDownloadArtwork = async (submission: SongSubmission) => {
    try {
      await downloadExternalBlob(submission.artwork, `${submission.title}-artwork.jpg`);
    } catch (error) {
      console.error('Download artwork error:', error);
      toast.error('Failed to download artwork');
    }
  };

  const handleDownloadAudio = async (submission: SongSubmission) => {
    try {
      await downloadExternalBlob(submission.audioFile, submission.audioFilename);
    } catch (error) {
      console.error('Download audio error:', error);
      toast.error('Failed to download audio');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sortedSubmissions || sortedSubmissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Song Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No submissions yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Song Submissions ({sortedSubmissions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedSubmissions.map((submission) => {
              const isEditing = editingId === submission.id;
              const currentStatus = editingStatus[submission.id] || submission.status;
              const showLiveUrlInput = currentStatus === SongStatus.live;

              return (
                <Card key={submission.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <img
                        src={submission.artwork.getDirectURL()}
                        alt={submission.title}
                        className="w-32 h-32 rounded-lg object-cover"
                      />
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-lg">{submission.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {submission.artist}
                              {submission.featuredArtist && ` ft. ${submission.featuredArtist}`}
                            </p>
                          </div>
                          {getStatusBadge(submission.status)}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Genre:</span> {submission.genre}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Language:</span> {submission.language}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Type:</span> {submission.releaseType}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Composer:</span> {submission.composer}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Producer:</span> {submission.producer}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Lyricist:</span> {submission.lyricist}
                          </div>
                        </div>

                        {submission.musicVideoLink && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Music Video:</span>{' '}
                            <a
                              href={submission.musicVideoLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              View Video
                            </a>
                          </div>
                        )}

                        {submission.adminLiveLink && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Live URL:</span>{' '}
                            <a
                              href={submission.adminLiveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline inline-flex items-center gap-1"
                            >
                              {submission.adminLiveLink}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        {isEditing ? (
                          <div className="space-y-3 border-t pt-3">
                            <div>
                              <Label>Status</Label>
                              <Select
                                value={currentStatus}
                                onValueChange={(value) => handleStatusChange(submission.id, value as SongStatus)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={SongStatus.pending}>Pending</SelectItem>
                                  <SelectItem value={SongStatus.approved}>Approved</SelectItem>
                                  <SelectItem value={SongStatus.rejected}>Rejected</SelectItem>
                                  <SelectItem value={SongStatus.live}>Live</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {showLiveUrlInput && (
                              <div>
                                <Label>Live URL *</Label>
                                <Input
                                  value={liveUrls[submission.id] || submission.adminLiveLink || ''}
                                  onChange={(e) =>
                                    setLiveUrls((prev) => ({ ...prev, [submission.id]: e.target.value }))
                                  }
                                  placeholder="https://..."
                                  required
                                />
                              </div>
                            )}

                            <div>
                              <Label>Admin Remarks</Label>
                              <Textarea
                                value={editingRemarks[submission.id] ?? submission.adminRemarks}
                                onChange={(e) =>
                                  setEditingRemarks((prev) => ({ ...prev, [submission.id]: e.target.value }))
                                }
                                rows={2}
                              />
                            </div>

                            <div>
                              <Label>Admin Comment</Label>
                              <Textarea
                                value={editingComments[submission.id] ?? submission.adminComment}
                                onChange={(e) =>
                                  setEditingComments((prev) => ({ ...prev, [submission.id]: e.target.value }))
                                }
                                rows={2}
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSave(submission)}
                                disabled={updateSubmission.isPending || setSubmissionLive.isPending}
                              >
                                {updateSubmission.isPending || setSubmissionLive.isPending ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  'Save'
                                )}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {submission.adminRemarks && (
                              <div className="bg-muted p-2 rounded text-sm">
                                <span className="font-medium">Remarks:</span> {submission.adminRemarks}
                              </div>
                            )}
                            {submission.adminComment && (
                              <div className="bg-muted p-2 rounded text-sm">
                                <span className="font-medium">Comment:</span> {submission.adminComment}
                              </div>
                            )}
                          </>
                        )}

                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button size="sm" variant="outline" onClick={() => handleDownloadArtwork(submission)}>
                            <Download className="w-4 h-4 mr-2" />
                            Artwork
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDownloadAudio(submission)}>
                            <Download className="w-4 h-4 mr-2" />
                            Audio
                          </Button>
                          {!isEditing && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => setEditingId(submission.id)}>
                                Edit Status
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditDialogSubmission(submission)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Details
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setDeleteConfirmId(submission.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this submission? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editDialogSubmission && (
        <AdminEditSubmissionDialog
          submission={editDialogSubmission}
          open={!!editDialogSubmission}
          onOpenChange={(open) => !open && setEditDialogSubmission(null)}
        />
      )}
    </>
  );
}
