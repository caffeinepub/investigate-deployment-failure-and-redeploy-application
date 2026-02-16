import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, Clock, Zap, TrendingUp, Radio } from 'lucide-react';
import { useGetVerifiedArtistStatus, useApplyForVerification } from '../hooks/useQueries';

export default function VerificationBenefitsSection() {
  const { data: verifiedStatus, isLoading: statusLoading } = useGetVerifiedArtistStatus();
  const applyForVerification = useApplyForVerification();

  // Don't show if user is already verified
  if (verifiedStatus?.isVerified && !verifiedStatus?.isExpired) {
    return null;
  }

  const benefits = [
    {
      icon: <CheckCircle2 className="w-5 h-5 text-blue-600" />,
      title: 'Blue Verified Badge',
      description: 'Stand out with a premium blue verification badge',
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
      title: 'Pro User Status',
      description: 'Your submissions appear first in admin review queue',
    },
    {
      icon: <Radio className="w-5 h-5 text-blue-600" />,
      title: 'Podcast Access',
      description: 'Exclusive ability to submit and manage podcasts',
    },
    {
      icon: <Clock className="w-5 h-5 text-blue-600" />,
      title: 'Priority Distribution',
      description: 'Song distribution within 24-48 hours',
    },
    {
      icon: <Zap className="w-5 h-5 text-blue-600" />,
      title: 'Custom Label Name',
      description: 'Option to use your own label name (may delay go-live)',
    },
  ];

  const handleApply = async () => {
    try {
      await applyForVerification.mutateAsync();
    } catch (error) {
      // Error already handled by mutation
    }
  };

  if (statusLoading) {
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
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Verified Artist Benefits</CardTitle>
          <Badge className="bg-blue-600 text-white">₹200/month</Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Unlock premium features and priority support for your music career
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
              <div className="mt-0.5">{benefit.icon}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{benefit.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          {verifiedStatus?.hasPendingRequest ? (
            <div className="text-center space-y-2">
              <Badge variant="secondary" className="text-sm">
                Application Pending Review
              </Badge>
              <p className="text-xs text-muted-foreground">
                Your verification application is under review by our admin team
              </p>
            </div>
          ) : (
            <Button
              onClick={handleApply}
              disabled={applyForVerification.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {applyForVerification.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Apply for Verification'
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
