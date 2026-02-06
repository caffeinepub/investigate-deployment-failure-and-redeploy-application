import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, TrendingUp, Users, Zap } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function LandingPage() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <img
              src="/assets/generated/platform-logo-transparent.dim_200x200.png"
              alt="ITMP Logo"
              className="w-32 h-32 mx-auto mb-6"
            />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              INDIE TAMIL MUSIC PRODUCTION
            </h1>
            <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Your Gateway to Tamil Music Distribution
            </p>
            <Button
              size="lg"
              onClick={login}
              disabled={isLoggingIn}
              className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isLoggingIn ? 'Logging in...' : 'Get Started'}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Why Choose INDIE TAMIL MUSIC PRODUCTION?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-2 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <Music className="w-12 h-12 text-purple-600 dark:text-purple-400 mb-4" />
                <CardTitle>Wide Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get your music on all major platforms including Spotify, Apple Music, YouTube Music, and more.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-pink-200 dark:border-pink-800">
              <CardHeader>
                <TrendingUp className="w-12 h-12 text-pink-600 dark:text-pink-400 mb-4" />
                <CardTitle>Artist Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Professional support to help you grow your audience and reach new listeners worldwide.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <Zap className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
                <CardTitle>Fast Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Quick turnaround times to get your music live on streaming platforms as soon as possible.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <Users className="w-12 h-12 text-purple-600 dark:text-purple-400 mb-4" />
                <CardTitle>Dedicated Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  24/7 support team ready to assist you with any questions or concerns about your releases.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900 dark:text-white">About Us</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            INDIE TAMIL MUSIC PRODUCTION is dedicated to empowering independent Tamil artists by providing
            professional music distribution services. We help artists reach global audiences while maintaining
            creative control over their work.
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Our platform simplifies the distribution process, allowing you to focus on what you do best – creating
            amazing music.
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Services & Procedure
          </h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Submit Your Music</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">
                  Upload your track with all necessary metadata including artwork, artist information, and release
                  details.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Quality Review</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">
                  Our team reviews your submission to ensure it meets platform requirements and quality standards.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">
                  Once approved, we distribute your music to all major streaming platforms and digital stores.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Track Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">
                  Monitor your release and track its performance across different platforms through your dashboard.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 p-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Pricing</h3>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
              <strong>Distribution Fee:</strong> ₹199 per release
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              <strong>Annual Maintenance:</strong> ₹1000 per year
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
            Ready to Share Your Music?
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
            Join INDIE TAMIL MUSIC PRODUCTION today and start your journey to reaching millions of listeners.
          </p>
          <Button
            size="lg"
            onClick={login}
            disabled={isLoggingIn}
            className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isLoggingIn ? 'Logging in...' : 'Get Started Now'}
          </Button>
        </div>
      </section>
    </div>
  );
}
