import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { CheckCircle, XCircle, Trash2, Edit2, Save, RotateCcw, Download } from 'lucide-react';
import { useGetAllSubmissions, useUpdateSubmissionStatus, useDeleteSubmission, useAddSongComment, useGetAllVerificationRequests, useIsCurrentUserAdmin } from '../hooks/useQueries';
import type { SongSubmission } from '../backend';
import { SongStatus } from '../backend';
import AdminEditSubmissionDialog from './AdminEditSubmissionDialog';
import VerifiedBadge from './VerifiedBadge';
import GreenBadge from './GreenBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { downloadExternalBlob } from '../utils/downloadExternalBlob';
import { toast } from 'sonner';

interface AdminSubmissionsListProps {
  isTeamMember?: boolean;
}

export default function AdminSubmissionsList({ isTeamMember = false }: AdminSubmissionsListProps) {
  const { data: submissions, isLoading } = useGetAllSubmissions();
  const { data: verificationRequests } = useGetAllVerificationRequests();
  const { data: isAdmin } = useIsCurrentUserAdmin();
  const updateStatus = useUpdateSubmissionStatus();
  const deleteSubmission = useDeleteSubmission();
  const addComment = useAddSongComment();
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [editingSubmission, setEditingSubmission] = useState<SongSubmission | null>(null);
  const [downloadingFiles, setDownloadingFiles] = useState<Record<string, boolean>>({});

  // Create a map of user principals to their badge status
  const badgeStatusMap = useMemo(() => {
    if (!verificationRequests) return new Map<string, boolean>();
    
    const map = new Map<string, boolean>();
    const now = Date.now() * 1000000; // Convert to nanoseconds
    const thirtyDaysNanos = 30 * 24 * 60 * 60 * 1000000000;
    
    verificationRequests.forEach((req) => {
      if (req.verificationApprovedTimestamp) {
        const approvedTime = Number(req.verificationApprovedTimestamp);
        const isActive = now - approvedTime <= thirtyDaysNanos;
        map.set(req.user.toString(), isActive);
      }
    });
    
    return map;
  }, [verificationRequests]);

  const handleStatusChange = async (id: string, newStatus: SongStatus) => {
    const remark = remarks[id] || '';
    
    if (newStatus === SongStatus.rejected && !remark.trim()) {
      alert('Please provide remarks for rejection');
      return;
    }
    
    await updateStatus.mutateAsync({
      id,
      status: newStatus,
      remarks: remark,
    });
    
    if (newStatus !== SongStatus.rejected) {
      setRemarks((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      await deleteSubmission.mutateAsync(id);
    }
  };

  const handleSaveComment = async (songId: string) => {
    const comment = comments[songId] || '';
    await addComment.mutateAsync({ songId, comment });
  };

  const handleDownloadArtwork = async (submission: SongSubmission) => {
    const key = `${submission.id}-artwork`;
    if (downloadingFiles[key]) return;

    setDownloadingFiles((prev) => ({ ...prev, [key]: true }));
    try {
      const filename = submission.artworkFilename && submission.artworkFilename !== 'UNKNOWN'
        ? submission.artworkFilename
        : `${submission.title.replace(/[^a-z0-9]/gi, '_')}_artwork.jpg`;
      
      await downloadExternalBlob(submission.artwork, filename);
      toast.success('Artwork downloaded successfully');
    } catch (error) {
      toast.error('Failed to download artwork');
      console.error('Download error:', error);
    } finally {
      setDownloadingFiles((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleDownloadAudio = async (submission: SongSubmission) => {
    const key = `${submission.id}-audio`;
    if (downloadingFiles[key]) return;

    setDownloadingFiles((prev) => ({ ...prev, [key]: true }));
    try {
      const filename = submission.audioFilename && submission.audioFilename !== 'UNKNOWN'
        ? submission.audioFilename
        : `${submission.title.replace(/[^a-z0-9]/gi, '_')}_audio.mp3`;
      
      await downloadExternalBlob(submission.audioFile, filename);
      toast.success('Audio file downloaded successfully');
    } catch (error) {
      toast.error('Failed to download audio file');
      console.error('Download error:', error);
    } finally {
      setDownloadingFiles((prev) => ({ ...prev, [key]: false }));
    }
  };

  const getStatusBadge = (status: SongStatus) => {
    if (status === SongStatus.approved) {
      return <Badge className="bg-green-600">Approved</Badge>;
    } else if (status === SongStatus.rejected || status === SongStatus.draft) {
      return <Badge variant="destructive">Draft</Badge>;
    }
    return <Badge className="bg-yellow-600">Pending</Badge>;
  };

  const getStatusLabel = (status: SongStatus): string => {
    if (status === SongStatus.approved) return 'approved';
    if (status === SongStatus.rejected || status === SongStatus.draft) return 'rejected';
    return 'pending';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No submissions yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {submissions.map((submission) => {
          const isBadgeActive = badgeStatusMap.get(submission.submitter.toString()) || false;
          
          return (
            <Card key={submission.id} className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={submission.artwork.getDirectURL()}
                    alt={submission.title}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{submission.title}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        Artist: {submission.artist}
                        {isBadgeActive ? <VerifiedBadge size="small" /> : <GreenBadge size="small" />}
                        {' | Genre: '}{submission.genre}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Language: {submission.language} | Release Date:{' '}
                        {new Date(Number(submission.releaseDate / BigInt(1000000))).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted: {new Date(Number(submission.timestamp / BigInt(1000000))).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(submission.status)}
                      {!isTeamMember && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingSubmission(submission)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(submission.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadArtwork(submission)}
                        disabled={downloadingFiles[`${submission.id}-artwork`]}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {downloadingFiles[`${submission.id}-artwork`] ? 'Downloading...' : 'Download Artwork'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadAudio(submission)}
                        disabled={downloadingFiles[`${submission.id}-audio`]}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {downloadingFiles[`${submission.id}-audio`] ? 'Downloading...' : 'Download Audio'}
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Admin Comment</label>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Add feedback for the artist..."
                        value={comments[submission.id] || submission.adminComment}
                        onChange={(e) =>
                          setComments((prev) => ({ ...prev, [submission.id]: e.target.value }))
                        }
                        className="flex-1"
                        rows={2}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSaveComment(submission.id)}
                        disabled={addComment.isPending}
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Change Status</label>
                    <div className="flex gap-2 items-start">
                      <Select
                        value={getStatusLabel(submission.status)}
                        onValueChange={(value) => {
                          if (value === 'approved') handleStatusChange(submission.id, SongStatus.approved);
                          else if (value === 'rejected') handleStatusChange(submission.id, SongStatus.rejected);
                          else if (value === 'pending') handleStatusChange(submission.id, SongStatus.pending);
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">
                            <div className="flex items-center gap-2">
                              <RotateCcw className="w-4 h-4" />
                              Pending
                            </div>
                          </SelectItem>
                          <SelectItem value="approved">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Approved
                            </div>
                          </SelectItem>
                          <SelectItem value="rejected">
                            <div className="flex items-center gap-2">
                              <XCircle className="w-4 h-4" />
                              Reject (Move to Draft)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex-1">
                        <Textarea
                          placeholder="Add remarks (required for rejection)..."
                          value={remarks[submission.id] || submission.adminRemarks || ''}
                          onChange={(e) =>
                            setRemarks((prev) => ({ ...prev, [submission.id]: e.target.value }))
                          }
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {submission.adminRemarks && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                        Rejection Remarks:
                      </p>
                      <p className="text-sm">{submission.adminRemarks}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {!isTeamMember && editingSubmission && (
        <AdminEditSubmissionDialog
          submission={editingSubmission}
          open={!!editingSubmission}
          onOpenChange={(open) => !open && setEditingSubmission(null)}
        />
      )}
    </>
  );
}
