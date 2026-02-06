import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, TrendingUp, BadgeCheck, CheckCircle, Headphones, IndianRupee } from 'lucide-react';
import { useApplyForVerification, useGetVerificationStatus } from '../hooks/useQueries';

export default function VerificationSubscriptionPage() {
  const { data: verificationStatus, isLoading } = useGetVerificationStatus();
  const applyForVerification = useApplyForVerification();
  const [hasApplied, setHasApplied] = useState(false);

  const isPending = verificationStatus === 'pending';
  const isApproved = verificationStatus === 'approved';
  const isWaiting = verificationStatus === 'waiting';
  const showWaitingMessage = hasApplied || isPending || isWaiting;

  const handleApply = async () => {
    try {
      await applyForVerification.mutateAsync();
      setHasApplied(true);
    } catch (error) {
      console.error('Failed to apply for verification:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <BadgeCheck className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Verification Subscription
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get verified and unlock premium benefits for faster distribution and exclusive perks
          </p>
        </div>

        {/* Already Verified Status */}
        {isApproved && (
          <Card className="mb-8 border-2 border-green-500/50 bg-green-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                  You are already verified!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Verification Card */}
        <Card className="mb-8 border-2 border-purple-500/30 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <Badge className="text-2xl px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500">
                ₹200 INR
              </Badge>
            </div>
            <CardTitle className="text-3xl mb-2">Premium Verification</CardTitle>
            <CardDescription className="text-base">
              One-time subscription for lifetime verification benefits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Benefits List */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Faster Distribution</h3>
                    <p className="text-sm text-muted-foreground">
                      Distribution within 24–48 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Quicker Approvals</h3>
                    <p className="text-sm text-muted-foreground">
                      Priority review and approval for verified artists
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                    <Headphones className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">24-Hour Contact Support</h3>
                    <p className="text-sm text-muted-foreground">
                      Get dedicated support within 24 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20">
                  <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">25% Discount</h3>
                    <p className="text-sm text-muted-foreground">
                      Save 25% on every release fee
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <IndianRupee className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">₹200 per Month</h3>
                    <p className="text-sm text-muted-foreground">
                      Exclusive monthly pricing for verified artists
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                  <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
                    <img 
                      src="/assets/ba30fb38768b44d381df36253bdce711.png" 
                      alt="Verified Badge" 
                      className="w-6 h-6"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Verified Badge</h3>
                    <p className="text-sm text-muted-foreground">
                      Display your verified status with an exclusive badge
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4">
                {/* Backend-connected Apply for Verification Button */}
                {showWaitingMessage ? (
                  <div className="text-center p-6 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30">
                    <CheckCircle className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                      You are now in the waiting list
                    </p>
                    <p className="text-muted-foreground">
                      Our team will contact you soon to complete the verification process
                    </p>
                  </div>
                ) : isApproved ? (
                  <div className="text-center p-6 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-500/30">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                      You are verified!
                    </p>
                  </div>
                ) : (
                  <Button
                    size="lg"
                    onClick={handleApply}
                    disabled={applyForVerification.isPending}
                    className="w-full text-lg py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {applyForVerification.isPending ? 'Processing...' : 'Apply for Verification'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card className="border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-xl">What happens after applying?</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                <p className="text-muted-foreground">
                  Your application is submitted to our admin team
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                <p className="text-muted-foreground">
                  Our team reviews your profile and submission history
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                <p className="text-muted-foreground">
                  We contact you via email with payment instructions
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">4</div>
                <p className="text-muted-foreground">
                  Once payment is confirmed, your verification is activated immediately
                </p>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
