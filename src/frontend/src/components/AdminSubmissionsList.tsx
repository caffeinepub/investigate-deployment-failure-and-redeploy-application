import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetAllSubmissionsForAdmin, useAdminUpdateSubmission, useAdminDeleteSubmission } from '../hooks/useQueries';
import { Loader2, Music, Calendar, Download, Trash2 } from 'lucide-react';
import { SongStatus } from '../backend';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function AdminSubmissionsList() {
  const { data: submissions, isLoading } = useGetAllSubmissionsForAdmin();
  const updateSubmission = useAdminUpdateSubmission();
  const deleteSubmission = useAdminDeleteSubmission();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<SongStatus>(SongStatus.pending);
  const [editRemarks, setEditRemarks] = useState('');
  const [editComment, setEditComment] = useState('');

  const startEdit = (submission: any) => {
    setEditingId(submission.id);
    setEditStatus(submission.status);
    setEditRemarks(submission.adminRemarks);
    setEditComment(submission.adminComment);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditStatus(SongStatus.pending);
    setEditRemarks('');
    setEditComment('');
  };

  const saveEdit = async (id: string) => {
    await updateSubmission.mutateAsync({
      id,
      status: editStatus,
      adminRemarks: editRemarks,
      adminComment: editComment,
    });
    cancelEdit();
  };

  const handleDelete = async (id: string) => {
    await deleteSubmission.mutateAsync(id);
  };

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Music className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No submissions yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <Card key={submission.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg">{submission.title}</CardTitle>
              {getStatusBadge(submission.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Artist:</span> {submission.artist}
              </div>
              <div>
                <span className="font-medium">Genre:</span> {submission.genre}
              </div>
              <div>
                <span className="font-medium">Language:</span> {submission.language}
              </div>
              <div>
                <span className="font-medium">Release Type:</span> {submission.releaseType}
              </div>
              <div>
                <span className="font-medium">Composer:</span> {submission.composer}
              </div>
              <div>
                <span className="font-medium">Producer:</span> {submission.producer}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Submitted: {new Date(Number(submission.timestamp / BigInt(1000000))).toLocaleDateString()}
            </div>

            {/* Download Buttons */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadFile(submission.artwork.getDirectURL(), submission.artworkFilename)}
              >
                <Download className="w-4 h-4 mr-2" />
                Artwork
              </Button>
              {submission.audioFile && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadFile(submission.audioFile.getDirectURL(), submission.audioFilename)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Audio
                </Button>
              )}
            </div>

            {/* Edit Form */}
            {editingId === submission.id ? (
              <div className="space-y-3 border-t pt-4">
                <div>
                  <Label>Status</Label>
                  <Select value={editStatus} onValueChange={(value) => setEditStatus(value as SongStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SongStatus.pending}>Pending</SelectItem>
                      <SelectItem value={SongStatus.approved}>Approved</SelectItem>
                      <SelectItem value={SongStatus.rejected}>Rejected</SelectItem>
                      <SelectItem value={SongStatus.draft}>Draft</SelectItem>
                      <SelectItem value={SongStatus.live}>Live</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Admin Remarks</Label>
                  <Textarea
                    value={editRemarks}
                    onChange={(e) => setEditRemarks(e.target.value)}
                    placeholder="Internal remarks"
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Admin Comment (visible to user)</Label>
                  <Textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    placeholder="Comment for the user"
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => saveEdit(submission.id)}
                    disabled={updateSubmission.isPending}
                  >
                    {updateSubmission.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save'
                    )}
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 border-t pt-4">
                <Button size="sm" onClick={() => startEdit(submission)}>
                  Edit Status
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Submission</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this submission? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(submission.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            {/* Display existing comments */}
            {!editingId && submission.adminComment && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium mb-1">Admin Comment:</p>
                <p className="text-sm">{submission.adminComment}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
