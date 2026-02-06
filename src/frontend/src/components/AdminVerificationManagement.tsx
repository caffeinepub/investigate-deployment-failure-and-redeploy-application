import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Clock, AlertCircle, Hourglass, User, Calendar } from 'lucide-react';
import { useGetAllVerificationRequests, useUpdateVerificationStatus, useUpdateVerificationExpiryDays } from '../hooks/useQueries';
import { VerificationStatus } from '../backend';
import VerifiedBadge from './VerifiedBadge';

export default function AdminVerificationManagement() {
  const { data: requests, isLoading } = useGetAllVerificationRequests();
  const updateStatus = useUpdateVerificationStatus();
  const updateExpiryDays = useUpdateVerificationExpiryDays();
  const [changingStatus, setChangingStatus] = useState<string | null>(null);
  const [expiryDaysInput, setExpiryDaysInput] = useState<{ [key: string]: string }>({});

  const waitingRequests = requests?.filter(req => req.status === VerificationStatus.waiting) || [];
  const pendingRequests = requests?.filter(req => req.status === VerificationStatus.pending) || [];
  const approvedRequests = requests?.filter(req => req.status === VerificationStatus.approved) || [];
  const rejectedRequests = requests?.filter(req => req.status === VerificationStatus.rejected) || [];

  // Calculate badge status for approved requests
  const approvedWithBadgeStatus = useMemo(() => {
    if (!approvedRequests) return [];
    
    const now = Date.now() * 1000000; // Convert to nanoseconds
    
    return approvedRequests.map((req) => {
      let isBadgeActive = false;
      if (req.verificationApprovedTimestamp) {
        const approvedTime = Number(req.verificationApprovedTimestamp);
        const totalDays = 30 + Number(req.expiryExtensionDays);
        const validPeriodNanos = totalDays * 24 * 60 * 60 * 1000000000;
        isBadgeActive = now - approvedTime <= validPeriodNanos;
      }
      return { ...req, isBadgeActive };
    });
  }, [approvedRequests]);

  const handleStatusChange = async (userId: string, newStatus: VerificationStatus) => {
    setChangingStatus(userId);
    try {
      await updateStatus.mutateAsync({ userId, status: newStatus });
    } catch (error) {
      console.error('Failed to update verification status:', error);
    } finally {
      setChangingStatus(null);
    }
  };

  const handleExpiryDaysUpdate = async (userId: string) => {
    const daysStr = expiryDaysInput[userId];
    if (!daysStr) return;
    
    const days = parseInt(daysStr, 10);
    if (isNaN(days) || days < 0) {
      return;
    }

    try {
      await updateExpiryDays.mutateAsync({ userId, extraDays: days });
      setExpiryDaysInput({ ...expiryDaysInput, [userId]: '' });
    } catch (error) {
      console.error('Failed to update expiry days:', error);
    }
  };

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.approved:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case VerificationStatus.rejected:
        return <XCircle className="w-4 h-4 text-red-500" />;
      case VerificationStatus.pending:
        return <Clock className="w-4 h-4 text-orange-500" />;
      case VerificationStatus.waiting:
        return <Hourglass className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusLabel = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.approved:
        return 'Approved';
      case VerificationStatus.rejected:
        return 'Rejected';
      case VerificationStatus.pending:
        return 'Pending';
      case VerificationStatus.waiting:
        return 'Waiting';
    }
  };

  const renderRequestCard = (request: any, showBadgeStatus = false) => {
    const isChanging = changingStatus === request.user.toString();
    const userId = request.user.toString();
    const currentExpiryDays = Number(request.expiryExtensionDays || 0);
    
    return (
      <div
        key={request.id}
        className="flex flex-col gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-muted-foreground" />
              <p className="font-medium flex items-center gap-1">
                {request.fullName}
                {showBadgeStatus && request.isBadgeActive && <VerifiedBadge size="small" />}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {request.status === VerificationStatus.approved ? 'Approved' : 
               request.status === VerificationStatus.rejected ? 'Rejected' :
               request.status === VerificationStatus.pending ? 'Applied' : 'Requested'}: {new Date(Number(request.timestamp / BigInt(1000000))).toLocaleDateString()}
              {showBadgeStatus && request.verificationApprovedTimestamp && (
                <> • Badge {request.isBadgeActive ? 'Active' : 'Expired'}</>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {showBadgeStatus && (
              <Badge className={request.isBadgeActive ? 'bg-green-600' : 'bg-gray-600'}>
                {request.isBadgeActive ? 'Verified' : 'Badge Expired'}
              </Badge>
            )}
            <Select
              value={request.status}
              onValueChange={(value) => handleStatusChange(request.user.toString(), value as VerificationStatus)}
              disabled={isChanging}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(request.status)}
                    <span>{getStatusLabel(request.status)}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={VerificationStatus.approved}>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Approved</span>
                  </div>
                </SelectItem>
                <SelectItem value={VerificationStatus.rejected}>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>Rejected</span>
                  </div>
                </SelectItem>
                <SelectItem value={VerificationStatus.pending}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span>Pending</span>
                  </div>
                </SelectItem>
                <SelectItem value={VerificationStatus.waiting}>
                  <div className="flex items-center gap-2">
                    <Hourglass className="w-4 h-4 text-yellow-500" />
                    <span>Waiting</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {showBadgeStatus && (
          <div className="flex items-end gap-3 pt-3 border-t">
            <div className="flex-1">
              <Label htmlFor={`expiry-${userId}`} className="text-xs flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3" />
                Extend Expiry (days beyond 30)
              </Label>
              <Input
                id={`expiry-${userId}`}
                type="number"
                min="0"
                placeholder={`Current: ${currentExpiryDays} days`}
                value={expiryDaysInput[userId] || ''}
                onChange={(e) => setExpiryDaysInput({ ...expiryDaysInput, [userId]: e.target.value })}
                className="h-9"
              />
            </div>
            <Button
              size="sm"
              onClick={() => handleExpiryDaysUpdate(userId)}
              disabled={!expiryDaysInput[userId] || updateExpiryDays.isPending}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {updateExpiryDays.isPending ? 'Updating...' : 'Update'}
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading verification requests...</p>
        </div>
      </div>
    );
  }

  const totalNewRequests = waitingRequests.length + pendingRequests.length;

  return (
    <div className="space-y-6">
      {/* Notification Alert */}
      {totalNewRequests > 0 && (
        <Alert className="border-orange-500/50 bg-orange-500/10">
          <AlertCircle className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-orange-600 dark:text-orange-400">
            You have {totalNewRequests} new verification {totalNewRequests === 1 ? 'request' : 'requests'} waiting for review
          </AlertDescription>
        </Alert>
      )}

      {/* Waiting Requests (from dashboard button clicks) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hourglass className="w-5 h-5 text-yellow-500" />
            Waiting List ({waitingRequests.length})
          </CardTitle>
          <CardDescription>Users who clicked the verification button in their dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          {waitingRequests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No users in the waiting list</p>
          ) : (
            <div className="space-y-4">
              {waitingRequests.map((request) => renderRequestCard(request))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Pending Requests ({pendingRequests.length})
          </CardTitle>
          <CardDescription>Review and manage verification applications</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No pending verification requests</p>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => renderRequestCard(request))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Approved ({approvedRequests.length})
          </CardTitle>
          <CardDescription>Verified artists with badge status and expiry extension control</CardDescription>
        </CardHeader>
        <CardContent>
          {approvedRequests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No approved verifications yet</p>
          ) : (
            <div className="space-y-4">
              {approvedWithBadgeStatus.map((request) => renderRequestCard(request, true))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejected Requests */}
      {rejectedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Rejected ({rejectedRequests.length})
            </CardTitle>
            <CardDescription>Declined verification requests - can be reconsidered at any time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rejectedRequests.map((request) => renderRequestCard(request))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
