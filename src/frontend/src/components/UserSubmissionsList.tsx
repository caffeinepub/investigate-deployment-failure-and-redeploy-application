import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGetMySubmissions } from '../hooks/useQueries';
import { Loader2, Music, Calendar } from 'lucide-react';
import { SongStatus } from '../backend';

export default function UserSubmissionsList() {
  const { data: submissions, isLoading } = useGetMySubmissions();

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
          <p className="text-sm text-muted-foreground mt-2">
            Submit your first song to get started
          </p>
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
          <CardContent className="space-y-2">
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
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Submitted: {new Date(Number(submission.timestamp / BigInt(1000000))).toLocaleDateString()}
            </div>

            {submission.adminComment && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm font-medium mb-1">Admin Comment:</p>
                <p className="text-sm">{submission.adminComment}</p>
              </div>
            )}

            {submission.adminRemarks && (
              <div className="mt-2 p-3 bg-muted rounded-md">
                <p className="text-sm font-medium mb-1">Admin Remarks:</p>
                <p className="text-sm">{submission.adminRemarks}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
