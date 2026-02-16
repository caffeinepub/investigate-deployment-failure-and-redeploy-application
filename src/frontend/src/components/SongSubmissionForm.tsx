import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSubmitSong, useGetMyArtistProfiles, useIsUserBlocked } from '../hooks/useQueries';
import { fileToExternalBlob } from '../utils/fileToExternalBlob';
import { SongSubmissionInput, TrackMetadata } from '../backend';
import { Loader2, Upload, Music, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import AlbumTracksEditor from './AlbumTracksEditor';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SongSubmissionForm() {
  const submitSong = useSubmitSong();
  const navigate = useNavigate();
  const { data: artistProfiles, isLoading: profilesLoading } = useGetMyArtistProfiles();
  const { data: isBlocked, isLoading: blockCheckLoading } = useIsUserBlocked();

  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [releaseType, setReleaseType] = useState('');
  const [genre, setGenre] = useState('');
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [selectedFeaturedArtists, setSelectedFeaturedArtists] = useState<string[]>([]);
  const [composer, setComposer] = useState('');
  const [producer, setProducer] = useState('');
  const [lyricist, setLyricist] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [musicVideoLink, setMusicVideoLink] = useState('');

  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [albumTracks, setAlbumTracks] = useState<TrackMetadata[]>([]);

  const [artworkProgress, setArtworkProgress] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [artworkError, setArtworkError] = useState('');

  const isAlbum = releaseType === 'Album';

  // Validate artwork dimensions and format
  const validateArtwork = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      
      if (!validTypes.includes(file.type)) {
        setArtworkError('Artwork must be JPG or PNG format');
        resolve(false);
        return;
      }

      const img = new Image();
      img.onload = () => {
        if (img.width === 3000 && img.height === 3000) {
          setArtworkError('');
          resolve(true);
        } else {
          setArtworkError(`Artwork must be exactly 3000×3000 pixels. Current: ${img.width}×${img.height}`);
          resolve(false);
        }
      };
      img.onerror = () => {
        setArtworkError('Failed to load image');
        resolve(false);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleArtworkChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isValid = await validateArtwork(file);
      if (isValid) {
        setArtworkFile(file);
      } else {
        setArtworkFile(null);
        e.target.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isBlocked) {
      toast.error('Your account has been blocked. You cannot submit songs.');
      return;
    }

    if (!artistProfiles || artistProfiles.length === 0) {
      toast.error('Please create an artist profile before submitting a song');
      return;
    }

    // Validation
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!language) {
      toast.error('Language is required');
      return;
    }
    if (!releaseDate) {
      toast.error('Release date is required');
      return;
    }
    if (!releaseType) {
      toast.error('Release type is required');
      return;
    }
    if (!genre) {
      toast.error('Genre is required');
      return;
    }
    if (selectedArtists.length === 0) {
      toast.error('At least one artist must be selected');
      return;
    }
    if (!composer.trim()) {
      toast.error('Composer is required');
      return;
    }
    if (!producer.trim()) {
      toast.error('Producer is required');
      return;
    }
    if (!lyricist.trim()) {
      toast.error('Lyricist is required');
      return;
    }
    if (!artworkFile) {
      toast.error('Artwork is required');
      return;
    }
    if (artworkError) {
      toast.error(artworkError);
      return;
    }

    // For albums, validate tracks
    if (isAlbum) {
      if (albumTracks.length === 0) {
        toast.error('At least one album track is required');
        return;
      }
      for (const track of albumTracks) {
        if (!track.title.trim()) {
          toast.error('All album tracks must have a title');
          return;
        }
        if (!track.artist.trim()) {
          toast.error('All album tracks must have an artist');
          return;
        }
      }
    } else {
      // For non-albums, audio file is required
      if (!audioFile) {
        toast.error('Audio file is required');
        return;
      }
    }

    try {
      setIsUploading(true);

      // Convert artwork
      const artworkBlob = await fileToExternalBlob(artworkFile, (progress) => {
        setArtworkProgress(progress);
      });

      // Convert audio file (only for non-albums)
      let audioBlob;
      if (!isAlbum && audioFile) {
        audioBlob = await fileToExternalBlob(audioFile, (progress) => {
          setAudioProgress(progress);
        });
      } else {
        // For albums, create a dummy audio blob (backend expects it)
        audioBlob = await fileToExternalBlob(new Blob(['dummy']), () => {});
      }

      const artistNames = selectedArtists
        .map((id) => artistProfiles?.find((p) => p.id === id)?.stageName)
        .filter(Boolean)
        .join(', ');

      const featuredNames = selectedFeaturedArtists
        .map((id) => artistProfiles?.find((p) => p.id === id)?.stageName)
        .filter(Boolean)
        .join(', ');

      const input: SongSubmissionInput = {
        title,
        language,
        releaseDate: BigInt(new Date(releaseDate).getTime()) * BigInt(1000000),
        releaseType,
        genre,
        artworkBlob,
        artworkFilename: artworkFile.name,
        artist: artistNames,
        featuredArtist: featuredNames,
        composer,
        producer,
        lyricist,
        audioBlob,
        audioFilename: audioFile?.name || 'album.mp3',
        additionalDetails,
        discountCode: discountCode.trim() ? discountCode : undefined,
        albumTracks: isAlbum && albumTracks.length > 0 ? albumTracks : undefined,
        musicVideoLink: musicVideoLink.trim() ? musicVideoLink : undefined,
      };

      await submitSong.mutateAsync(input);

      // Reset form
      setTitle('');
      setLanguage('');
      setReleaseDate('');
      setReleaseType('');
      setGenre('');
      setSelectedArtists([]);
      setSelectedFeaturedArtists([]);
      setComposer('');
      setProducer('');
      setLyricist('');
      setAdditionalDetails('');
      setDiscountCode('');
      setMusicVideoLink('');
      setArtworkFile(null);
      setAudioFile(null);
      setAlbumTracks([]);
      setArtworkProgress(0);
      setAudioProgress(0);
      setArtworkError('');

      // Navigate to thank you page
      navigate({ to: '/thank-you' });
    } catch (error: any) {
      console.error('Submission error:', error);
      if (error.message?.includes('blocked')) {
        toast.error('Your account has been blocked. You cannot submit songs.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const toggleArtistSelection = (profileId: string) => {
    setSelectedArtists((prev) =>
      prev.includes(profileId) ? prev.filter((id) => id !== profileId) : [...prev, profileId]
    );
  };

  const toggleFeaturedArtistSelection = (profileId: string) => {
    setSelectedFeaturedArtists((prev) =>
      prev.includes(profileId) ? prev.filter((id) => id !== profileId) : [...prev, profileId]
    );
  };

  if (blockCheckLoading || profilesLoading) {
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

  if (isBlocked) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            Account Blocked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Your account has been blocked. You cannot submit songs at this time. Please contact support for assistance.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!artistProfiles || artistProfiles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Submit New Song
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              You must create at least one artist profile before submitting a song. Please go to the "Artist Profiles" tab to create your profile.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="w-5 h-5" />
          Submit New Song
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Song title"
              required
            />
          </div>

          {/* Language */}
          <div>
            <Label htmlFor="language">Language *</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tamil">Tamil</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Hindi">Hindi</SelectItem>
                <SelectItem value="Telugu">Telugu</SelectItem>
                <SelectItem value="Malayalam">Malayalam</SelectItem>
                <SelectItem value="Kannada">Kannada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Release Date */}
          <div>
            <Label htmlFor="releaseDate">Release Date *</Label>
            <Input
              id="releaseDate"
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              required
            />
          </div>

          {/* Release Type */}
          <div>
            <Label htmlFor="releaseType">Release Type *</Label>
            <Select value={releaseType} onValueChange={setReleaseType}>
              <SelectTrigger>
                <SelectValue placeholder="Select release type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="Album">Album</SelectItem>
                <SelectItem value="EP">EP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Genre */}
          <div>
            <Label htmlFor="genre">Genre *</Label>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger>
                <SelectValue placeholder="Select genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pop">Pop</SelectItem>
                <SelectItem value="Rock">Rock</SelectItem>
                <SelectItem value="Hip Hop">Hip Hop</SelectItem>
                <SelectItem value="Classical">Classical</SelectItem>
                <SelectItem value="Folk">Folk</SelectItem>
                <SelectItem value="Electronic">Electronic</SelectItem>
                <SelectItem value="Jazz">Jazz</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Artist Selection */}
          <div>
            <Label>Artist(s) *</Label>
            <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
              {artistProfiles.map((profile) => (
                <div key={profile.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`artist-${profile.id}`}
                    checked={selectedArtists.includes(profile.id)}
                    onChange={() => toggleArtistSelection(profile.id)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label htmlFor={`artist-${profile.id}`} className="text-sm cursor-pointer flex-1">
                    {profile.stageName} ({profile.fullName})
                  </label>
                </div>
              ))}
            </div>
            {selectedArtists.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">Select at least one artist</p>
            )}
          </div>

          {/* Featured Artist Selection */}
          <div>
            <Label>Featured Artist(s) (Optional)</Label>
            <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
              {artistProfiles.map((profile) => (
                <div key={profile.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`featured-${profile.id}`}
                    checked={selectedFeaturedArtists.includes(profile.id)}
                    onChange={() => toggleFeaturedArtistSelection(profile.id)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label htmlFor={`featured-${profile.id}`} className="text-sm cursor-pointer flex-1">
                    {profile.stageName} ({profile.fullName})
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Composer */}
          <div>
            <Label htmlFor="composer">Composer *</Label>
            <Input
              id="composer"
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              placeholder="Composer name"
              required
            />
          </div>

          {/* Producer */}
          <div>
            <Label htmlFor="producer">Producer *</Label>
            <Input
              id="producer"
              value={producer}
              onChange={(e) => setProducer(e.target.value)}
              placeholder="Producer name"
              required
            />
          </div>

          {/* Lyricist */}
          <div>
            <Label htmlFor="lyricist">Lyricist *</Label>
            <Input
              id="lyricist"
              value={lyricist}
              onChange={(e) => setLyricist(e.target.value)}
              placeholder="Lyricist name"
              required
            />
          </div>

          {/* Artwork Upload */}
          <div>
            <Label htmlFor="artwork">Artwork * (JPG/PNG, 3000×3000 pixels)</Label>
            <Input
              id="artwork"
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleArtworkChange}
              required
            />
            {artworkError && (
              <p className="text-sm text-destructive mt-1">{artworkError}</p>
            )}
            {artworkProgress > 0 && artworkProgress < 100 && (
              <div className="mt-2 text-sm text-muted-foreground">
                Uploading artwork: {artworkProgress}%
              </div>
            )}
          </div>

          {/* Audio Upload (only for non-albums) */}
          {!isAlbum && (
            <div>
              <Label htmlFor="audio">Audio File *</Label>
              <Input
                id="audio"
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                required
              />
              {audioProgress > 0 && audioProgress < 100 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Uploading audio: {audioProgress}%
                </div>
              )}
            </div>
          )}

          {/* Album Tracks Editor (only for albums) */}
          {isAlbum && (
            <div>
              <Label>Album Tracks *</Label>
              <AlbumTracksEditor tracks={albumTracks} onChange={setAlbumTracks} />
            </div>
          )}

          {/* Music Video Link */}
          <div>
            <Label htmlFor="musicVideoLink">Music Video Link (Optional)</Label>
            <Input
              id="musicVideoLink"
              value={musicVideoLink}
              onChange={(e) => setMusicVideoLink(e.target.value)}
              placeholder="https://..."
            />
          </div>

          {/* Additional Details */}
          <div>
            <Label htmlFor="additionalDetails">Additional Details</Label>
            <Textarea
              id="additionalDetails"
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              placeholder="Any additional information"
              rows={3}
            />
          </div>

          {/* Optional Fields */}
          <div>
            <Label htmlFor="discountCode">Discount Code (Optional)</Label>
            <Input
              id="discountCode"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Discount code"
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isUploading || submitSong.isPending} className="w-full">
            {isUploading || submitSong.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Submit Song
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
