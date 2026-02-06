import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { LogOut, LogIn, Moon, Sun, BadgeCheck, BookOpen } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useGetCallerUserProfile, useGetArtistProfile, useIsVerificationBadgeActive, useGetCallerRole } from '../hooks/useQueries';
import { AppUserRole } from '../backend';
import VerifiedBadge from './VerifiedBadge';
import GreenBadge from './GreenBadge';

export default function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: artistProfile } = useGetArtistProfile();
  const { data: isBadgeActive } = useIsVerificationBadgeActive();
  const { data: userRole } = useGetCallerRole();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const routerState = useRouterState();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const currentPath = routerState.location.pathname;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const displayName = artistProfile?.stageName || userProfile?.name;
  const displayImage = artistProfile?.profilePhoto?.getDirectURL();

  // Show verification button only for regular users
  const showVerificationButton = isAuthenticated && userRole === AppUserRole.user;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-2 sm:px-4 h-16 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button onClick={() => navigate({ to: '/' })} className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity min-w-0">
            <img 
              src="/assets/generated/new-logo-transparent.dim_200x200.png" 
              alt="INDIE TAMIL MUSIC PRODUCTION Logo" 
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0" 
            />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent truncate">
                INDIE TAMIL MUSIC PRODUCTION
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Distribution Platform</p>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
          <Button
            variant={currentPath === '/blog' ? 'default' : 'ghost'}
            onClick={() => navigate({ to: '/blog' })}
            size="sm"
            className="hidden md:flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Blog
          </Button>

          {showVerificationButton && (
            <Button
              variant={currentPath === '/verification-subscription' ? 'default' : 'ghost'}
              onClick={() => navigate({ to: '/verification-subscription' })}
              size="sm"
              className="hidden lg:flex items-center gap-2"
            >
              <BadgeCheck className="w-4 h-4" />
              Verification
            </Button>
          )}

          {isAuthenticated && displayName && (
            <div className="hidden md:flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-accent/50">
              {displayImage ? (
                <img src={displayImage} alt={displayName} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs sm:text-sm font-semibold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs sm:text-sm font-medium flex items-center gap-1 max-w-[100px] truncate">
                {displayName}
                {isBadgeActive ? <VerifiedBadge size="small" /> : <GreenBadge size="small" />}
              </span>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
          </Button>

          <Button
            onClick={handleAuth}
            disabled={disabled}
            variant={isAuthenticated ? 'outline' : 'default'}
            size="sm"
            className="rounded-full text-xs sm:text-sm"
          >
            {disabled ? (
              'Loading...'
            ) : isAuthenticated ? (
              <>
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </>
            ) : (
              <>
                <LogIn className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Login</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
