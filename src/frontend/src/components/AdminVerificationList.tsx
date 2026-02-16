import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import {
  useGetVerificationRequestsForAdmin,
  useAdminActivateVerifiedArtist,
  useAdminExtendVerifiedExpiry,
  useAdminUpdateVerificationRequestStatus,
} from '../hooks/useQueries';

export default function AdminVerificationList() {
  const { data: requests, isLoading } = useGetVerificationRequestsForAdmin();
  const activateVerified = useAdminActivateVerifiedArtist();
  const extendExpiry = useAdminExtendVerifiedExpiry();
  const updateStatus = useAdminUpdateVerificationRequestStatus();

  const [extensionDays, setExtensionDays] = useState<{ [key: string]: number }>({});

  const pendingCount = requests?.filter((r) => r.status === 'pending').length || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-600 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Rejected
          </Badge>
        );
      case 'waiting':
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Waiting
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleActivate = async (userPrincipal: string) => {
    try {
      await activateVerified.mutateAsync(userPrincipal);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleExtend = async (userPrincipal: string) => {
    const days = extensionDays[userPrincipal] || 30;
    try {
      await extendExpiry.mutateAsync({ userPrincipal, extensionDays: days });
      setExtensionDays((prev) => {
        const updated = { ...prev };
        delete updated[userPrincipal];
        return updated;
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await updateStatus.mutateAsync({ requestId, status: 'rejected' });
    } catch (error) {
      // Error handled by mutation
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Verification List</CardTitle>
          {pendingCount > 0 && (
            <Badge className="bg-orange-600 text-white">
              {pendingCount} Pending Request{pendingCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingCount > 0 && (
          <Alert className="bg-orange-50 border-orange-200">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              You have {pendingCount} pending verification request{pendingCount !== 1 ? 's' : ''} awaiting review.
            </AlertDescription>
          </Alert>
        )}

        {!requests || requests.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No verification requests yet.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const userPrincipalStr = request.user.toString();
              const isApproved = request.status === 'approved';
              const expiryDate = request.verificationApprovedTimestamp
                ? new Date(Number(request.verificationApprovedTimestamp / BigInt(1000000)) + 30 * 24 * 60 * 60 * 1000)
                : null;

              return (
                <Card key={request.id} className="border-2">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{request.fullName}</h3>
                          <p className="text-xs text-muted-foreground font-mono mt-1">{userPrincipalStr}</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Requested: {new Date(Number(request.timestamp / BigInt(1000000))).toLocaleDateString()}
                          </p>
                          {isApproved && expiryDate && (
                            <p className="text-sm text-muted-foreground">
                              Expires: {expiryDate.toLocaleDateString()}
                              {request.expiryExtensionDays > 0 && (
                                <span className="text-green-600 ml-2">
                                  (+{request.expiryExtensionDays} days extended)
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                        {getStatusBadge(request.status)}
                      </div>

                      {request.status === 'pending' && (
                        <div className="flex flex-wrap gap-2 pt-2 border-t">
                          <Button
                            size="sm"
                            onClick={() => handleActivate(userPrincipalStr)}
                            disabled={activateVerified.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {activateVerified.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Activating...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve & Activate
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(request.id)}
                            disabled={updateStatus.isPending}
                          >
                            {updateStatus.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Rejecting...
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {isApproved && (
                        <div className="space-y-2 pt-2 border-t">
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(request.id)}
                              disabled={updateStatus.isPending}
                            >
                              {updateStatus.isPending ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Unverifying...
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Unverify / Reject
                                </>
                              )}
                            </Button>
                          </div>
                          <Label className="text-sm">Extend Expiry (days)</Label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              min="1"
                              value={extensionDays[userPrincipalStr] || 30}
                              onChange={(e) =>
                                setExtensionDays((prev) => ({
                                  ...prev,
                                  [userPrincipalStr]: parseInt(e.target.value) || 30,
                                }))
                              }
                              className="w-24"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleExtend(userPrincipalStr)}
                              disabled={extendExpiry.isPending}
                            >
                              {extendExpiry.isPending ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Extending...
                                </>
                              ) : (
                                'Extend'
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
