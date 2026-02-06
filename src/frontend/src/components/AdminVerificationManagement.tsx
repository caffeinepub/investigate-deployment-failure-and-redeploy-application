import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Clock, AlertCircle, Calendar } from 'lucide-react';
import { useGetAllVerificationRequests, useUpdateVerificationStatusWithData, useUpdateVerificationExpiryDays } from '../hooks/useQueries';
import { VerificationStatus } from '../backend';

export default function AdminVerificationManagement() {
  const { data: verificationRequests, isLoading } = useGetAllVerificationRequests();
  const updateStatus = useUpdateVerificationStatusWithData();
  const updateExpiryDays = useUpdateVerificationExpiryDays();
  const [expiryDaysInput, setExpiryDaysInput] = useState<Record<string, string>>({});

  const requestsByStatus = useMemo(() => {
    if (!verificationRequests) return { pending: [], approved: [], rejected: [], waiting: [] };
    
    return {
      pending: verificationRequests.filter((req) => req.status === 'pending'),
      approved: verificationRequests.filter((req) => req.status === 'approved'),
      rejected: verificationRequests.filter((req) => req.status === 'rejected'),
      waiting: verificationRequests.filter((req) => req.status === 'waiting'),
    };
  }, [verificationRequests]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    let status: VerificationStatus;
    if (newStatus === 'approved') status = 'approved' as VerificationStatus;
    else if (newStatus === 'rejected') status = 'rejected' as VerificationStatus;
    else if (newStatus === 'waiting') status = 'waiting' as VerificationStatus;
    else status = 'pending' as VerificationStatus;

    await updateStatus.mutateAsync({ id, status });
  };

  const handleUpdateExpiryDays = async (userId: any, requestId: string) => {
    const daysStr = expiryDaysInput[requestId];
    if (!daysStr) return;

    const days = parseInt(daysStr);
    if (isNaN(days) || days < 0) {
      alert('Please enter a valid number of days');
      return;
    }

    await updateExpiryDays.mutateAsync({ userId, extraDays: BigInt(days) });
    setExpiryDaysInput((prev) => ({ ...prev, [requestId]: '' }));
  };

  const getBadgeExpiry = (request: any) => {
    if (!request.verificationApprovedTimestamp) return null;

    const approvedTime = Number(request.verificationApprovedTimestamp);
    const totalDays = 30 + Number(request.expiryExtensionDays);
    const validPeriodNanos = totalDays * 24 * 60 * 60 * 1000000000;
    const expiryTime = approvedTime + validPeriodNanos;
    const now = Date.now() * 1000000;
    const isActive = now < expiryTime;

    return {
      isActive,
      expiryDate: new Date(expiryTime / 1000000),
      daysRemaining: Math.ceil((expiryTime - now) / (24 * 60 * 60 * 1000000000)),
    };
  };

  const renderRequestCard = (request: any) => {
    const badgeExpiry = getBadgeExpiry(request);

    return (
      <Card key={request.id}>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{request.fullName}</h4>
                <code className="text-xs text-muted-foreground">{request.user.toString()}</code>
                <p className="text-sm text-muted-foreground mt-1">
                  Requested: {new Date(Number(request.timestamp / BigInt(1000000))).toLocaleDateString()}
                </p>
                {badgeExpiry && (
                  <div className="mt-2">
                    <Badge variant={badgeExpiry.isActive ? 'default' : 'destructive'}>
                      {badgeExpiry.isActive ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active ({badgeExpiry.daysRemaining} days left)
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Expired
                        </>
                      )}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Expires: {badgeExpiry.expiryDate.toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              <Select
                value={request.status}
                onValueChange={(value) => handleStatusChange(request.id, value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
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
                      Rejected
                    </div>
                  </SelectItem>
                  <SelectItem value="waiting">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Waiting List
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {request.status === 'approved' && (
              <div className="border-t pt-4">
                <Label htmlFor={`expiry-${request.id}`} className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" />
                  Extend Verification Period
                </Label>
                <div className="flex gap-2">
                  <Input
                    id={`expiry-${request.id}`}
                    type="number"
                    min="0"
                    placeholder="Extra days"
                    value={expiryDaysInput[request.id] || ''}
                    onChange={(e) =>
                      setExpiryDaysInput((prev) => ({ ...prev, [request.id]: e.target.value }))
                    }
                  />
                  <Button
                    size="sm"
                    onClick={() => handleUpdateExpiryDays(request.user, request.id)}
                    disabled={!expiryDaysInput[request.id] || updateExpiryDays.isPending}
                  >
                    Update
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Current extension: {Number(request.expiryExtensionDays)} days
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Verification Requests</CardTitle>
          <CardDescription>Manage artist verification applications</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">
                Pending ({requestsByStatus.pending.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({requestsByStatus.approved.length})
              </TabsTrigger>
              <TabsTrigger value="waiting">
                Waiting ({requestsByStatus.waiting.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({requestsByStatus.rejected.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 mt-4">
              {requestsByStatus.pending.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No pending requests</p>
              ) : (
                requestsByStatus.pending.map(renderRequestCard)
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4 mt-4">
              {requestsByStatus.approved.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No approved requests</p>
              ) : (
                requestsByStatus.approved.map(renderRequestCard)
              )}
            </TabsContent>

            <TabsContent value="waiting" className="space-y-4 mt-4">
              {requestsByStatus.waiting.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No waiting requests</p>
              ) : (
                requestsByStatus.waiting.map(renderRequestCard)
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4 mt-4">
              {requestsByStatus.rejected.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No rejected requests</p>
              ) : (
                requestsByStatus.rejected.map(renderRequestCard)
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
