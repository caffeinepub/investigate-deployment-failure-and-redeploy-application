import { useState } from 'react';
import { useGetUserSubmissions, useIsVerificationBadgeActive, useUpdateSongSubmission } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Music, Calendar, AlertCircle, Globe, MessageSquare, Edit2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import VerifiedBadge from './VerifiedBadge';
import GreenBadge from './GreenBadge';
import { SongStatus } from '../backend';
import type { SongSubmission } from '../backend';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import UserEditSubmissionDialog from './UserEditSubmissionDialog';

export default function UserSubmissionsList() {
  const { data: submissions, isLoading } = useGetUserSubmissions();
  const { data: isBadgeActive } = useIsVerificationBadgeActive();
  const [editingSubmission, setEditingSubmission] = useState<SongSubmission | null>(null);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading your submissions...</p>
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
          <p className="text-muted-foreground">Submit your first track to get started!</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: SongStatus) => {
    if (status === SongStatus.approved) {
      return <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/50">Approved</Badge>;
    } else if (status === SongStatus.rejected || status === SongStatus.draft) {
      return <Badge variant="destructive">Draft</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  const canEdit = (status: SongStatus) => {
    return status === SongStatus.pending || status === SongStatus.rejected || status === SongStatus.draft;
  };

  return (
    <>
      <div className="space-y-4">
        {submissions.map((submission) => (
          <Card key={submission.id} className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 flex-1">
                  <img
                    src={submission.artwork.getDirectURL()}
                    alt={submission.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <CardTitle className="mb-1">{submission.title}</CardTitle>
                    <CardDescription className="space-y-1">
                      <div className="flex items-center gap-1">
                        by {submission.artist}
                        {isBadgeActive ? <VerifiedBadge size="small" /> : <GreenBadge size="small" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="w-3 h-3" />
                        Submitted: {new Date(Number(submission.timestamp / BigInt(1000000))).toLocaleDateString()}
                      </div>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(submission.status)}
                  {canEdit(submission.status) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingSubmission(submission)}
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <span className="text-muted-foreground">Genre:</span>
                  <div className="font-medium">{submission.genre}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Release Type:</span>
                  <div className="font-medium">{submission.releaseType}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Language:</span>
                  <div className="font-medium flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {submission.language}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Release Date:</span>
                  <div className="font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(Number(submission.releaseDate / BigInt(1000000))).toLocaleDateString()}
                  </div>
                </div>
                {submission.featuredArtist && (
                  <div>
                    <span className="text-muted-foreground">Featured:</span>
                    <div className="font-medium">{submission.featuredArtist}</div>
                  </div>
                )}
                {submission.producer && (
                  <div>
                    <span className="text-muted-foreground">Producer:</span>
                    <div className="font-medium">{submission.producer}</div>
                  </div>
                )}
              </div>

              {submission.status === SongStatus.draft && submission.adminRemarks && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Admin Remarks:</strong> {submission.adminRemarks}
                  </AlertDescription>
                </Alert>
              )}

              {/* Admin Comment Display - Read Only */}
              {submission.adminComment && submission.adminComment.trim() !== '' && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-semibold mb-2 text-blue-900 dark:text-blue-100">
                    <MessageSquare className="w-4 h-4" />
                    Admin Feedback
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {submission.adminComment}
                  </p>
                </div>
              )}

              <audio controls className="w-full mt-4">
                <source src={submission.audioFile.getDirectURL()} />
                Your browser does not support the audio element.
              </audio>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingSubmission && (
        <UserEditSubmissionDialog
          submission={editingSubmission}
          open={!!editingSubmission}
          onOpenChange={(open) => !open && setEditingSubmission(null)}
        />
      )}
    </>
  );
}
