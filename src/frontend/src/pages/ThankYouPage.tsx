import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function ThankYouPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 border-green-500/20">
          <CardHeader className="space-y-6 pb-8">
            <div className="w-24 h-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <div>
              <CardTitle className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Thank You!
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                We got your submission.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-base text-muted-foreground">
              Your song has been successfully submitted for review. Our team will review your submission and get back to you soon.
            </p>
            <Button
              size="lg"
              onClick={() => navigate({ to: '/' })}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

