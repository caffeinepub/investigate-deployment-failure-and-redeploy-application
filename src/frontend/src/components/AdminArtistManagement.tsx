import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, Mail, Phone, Instagram, Facebook, Edit2 } from 'lucide-react';
import { SiSpotify, SiApplemusic } from 'react-icons/si';
import { useGetAllArtists, useGetAllVerificationRequests } from '../hooks/useQueries';
import AdminEditArtistDialog from './AdminEditArtistDialog';
import VerifiedBadge from './VerifiedBadge';
import GreenBadge from './GreenBadge';
import type { ArtistProfile } from '../backend';

interface AdminArtistManagementProps {
  isTeamMember?: boolean;
}

export default function AdminArtistManagement({ isTeamMember = false }: AdminArtistManagementProps) {
  const { data: artistsWithUserIds } = useGetAllArtists();
  const { data: verificationRequests } = useGetAllVerificationRequests();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingArtist, setEditingArtist] = useState<{ principal: string; profile: ArtistProfile } | null>(null);

  // Create a map of user principals to their badge status
  const badgeStatusMap = useMemo(() => {
    if (!verificationRequests) return new Map<string, boolean>();
    
    const map = new Map<string, boolean>();
    const now = Date.now() * 1000000;
    const thirtyDaysNanos = 30 * 24 * 60 * 60 * 1000000000;
    
    verificationRequests.forEach((req) => {
      if (req.verificationApprovedTimestamp) {
        const approvedTime = Number(req.verificationApprovedTimestamp);
        const isActive = now - approvedTime <= thirtyDaysNanos;
        map.set(req.user.toString(), isActive);
      }
    });
    
    return map;
  }, [verificationRequests]);

  // Transform the data for display
  const artists = useMemo(() => {
    if (!artistsWithUserIds) return [];
    
    return artistsWithUserIds.map(([principal, profile]) => ({
      principal: (principal as any).toString(),
      profile,
    }));
  }, [artistsWithUserIds]);

  const filteredArtists = artists.filter((artist) =>
    artist.profile.stageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.profile.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.principal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="search">Search Artists</Label>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Search by name or principal ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredArtists.length > 0 ? (
        <div className="grid gap-4">
          {filteredArtists.map((artist) => {
            const isBadgeActive = badgeStatusMap.get(artist.principal) || false;
            
            return (
              <Card key={artist.principal} className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <img
                    src={artist.profile.profilePhoto.getDirectURL()}
                    alt={artist.profile.stageName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-primary/30"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                          {artist.profile.stageName}
                          {isBadgeActive ? <VerifiedBadge size="medium" /> : <GreenBadge size="medium" />}
                        </h3>
                        <p className="text-muted-foreground">{artist.profile.fullName}</p>
                        <code className="text-xs text-muted-foreground">{artist.principal}</code>
                      </div>
                      {!isTeamMember && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingArtist(artist)}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {artist.profile.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{artist.profile.email}</span>
                        </div>
                      )}
                      {artist.profile.mobileNumber && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{artist.profile.mobileNumber}</span>
                        </div>
                      )}
                      {artist.profile.instagramLink && (
                        <div className="flex items-center gap-2">
                          <Instagram className="w-4 h-4 text-muted-foreground" />
                          <a
                            href={artist.profile.instagramLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Instagram
                          </a>
                        </div>
                      )}
                      {artist.profile.facebookLink && (
                        <div className="flex items-center gap-2">
                          <Facebook className="w-4 h-4 text-muted-foreground" />
                          <a
                            href={artist.profile.facebookLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Facebook
                          </a>
                        </div>
                      )}
                      {artist.profile.spotifyProfile && (
                        <div className="flex items-center gap-2">
                          <SiSpotify className="w-4 h-4 text-muted-foreground" />
                          <a
                            href={artist.profile.spotifyProfile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Spotify
                          </a>
                        </div>
                      )}
                      {artist.profile.appleProfile && (
                        <div className="flex items-center gap-2">
                          <SiApplemusic className="w-4 h-4 text-muted-foreground" />
                          <a
                            href={artist.profile.appleProfile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Apple Music
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm ? 'No artists found' : 'No artists yet'}
          </p>
        </div>
      )}

      {!isTeamMember && editingArtist && (
        <AdminEditArtistDialog
          artistPrincipal={editingArtist.principal}
          artistProfile={editingArtist.profile}
          open={!!editingArtist}
          onOpenChange={(open) => !open && setEditingArtist(null)}
        />
      )}
    </div>
  );
}
