import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRootRoute, createRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useHasCompleteArtistProfile, useGetCallerRole } from './hooks/useQueries';
import { useActor } from './hooks/useActor';
import { AppUserRole } from './backend';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TeamDashboard from './pages/TeamDashboard';
import VerificationSubscriptionPage from './pages/VerificationSubscriptionPage';
import ThankYouPage from './pages/ThankYouPage';
import BlogPage from './pages/BlogPage';
import ProfileSetupModal from './components/ProfileSetupModal';
import ArtistSetupForm from './components/ArtistSetupForm';
import AnnouncementPopup from './components/AnnouncementPopup';
import VerificationBenefitsPopup from './components/VerificationBenefitsPopup';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const queryClient = new QueryClient();

const rootRoute = createRootRoute({
  component: Layout,
});

function Layout() {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-8rem)]">
        <AppContent />
      </main>
      <Footer />
    </>
  );
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: AppContent,
});

const verificationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/verification-subscription',
  component: VerificationSubscriptionPage,
});

const thankYouRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/thank-you',
  component: ThankYouPage,
});

const blogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/blog',
  component: BlogPage,
});

const routeTree = rootRoute.addChildren([indexRoute, verificationRoute, thankYouRoute, blogRoute]);

const router = createRouter({ routeTree });

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: hasArtistProfile, isLoading: artistProfileLoading } = useHasCompleteArtistProfile();
  const { data: userRole, isLoading: roleLoading } = useGetCallerRole();
  const [showArtistSetup, setShowArtistSetup] = useState(false);

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  useEffect(() => {
    if (isAuthenticated && userProfile && hasArtistProfile === false && !artistProfileLoading) {
      setShowArtistSetup(true);
    } else if (hasArtistProfile === true) {
      setShowArtistSetup(false);
    }
  }, [isAuthenticated, userProfile, hasArtistProfile, artistProfileLoading]);

  // Show loading while initializing or waiting for actor
  if (isInitializing || actorFetching || !actor) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // Show loading while fetching profile data
  if (profileLoading || (isAuthenticated && roleLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (showProfileSetup) {
    return <ProfileSetupModal />;
  }

  // Render based on user role
  const renderDashboard = () => {
    if (userRole === AppUserRole.admin) {
      return <AdminDashboard />;
    } else if (userRole === AppUserRole.team) {
      return <TeamDashboard />;
    } else {
      return (
        <>
          <UserDashboard />
          <AnnouncementPopup />
          <VerificationBenefitsPopup />
        </>
      );
    }
  };

  return (
    <>
      {renderDashboard()}
      <Dialog open={showArtistSetup} onOpenChange={setShowArtistSetup}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Your Artist Profile</DialogTitle>
            <DialogDescription>
              Please fill in your artist information to start submitting music
            </DialogDescription>
          </DialogHeader>
          <ArtistSetupForm onSuccess={() => setShowArtistSetup(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <RouterProvider router={router} />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
