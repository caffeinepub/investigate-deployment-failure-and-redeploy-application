import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSubmitSong } from '../hooks/useQueries';
import { fileToExternalBlob } from '../utils/fileToExternalBlob';
import { SubmitSongInput, TrackMetadata } from '../backend';
import { Loader2, Upload, Music } from 'lucide-react';
import { toast } from 'sonner';
import AlbumTracksEditor from './AlbumTracksEditor';

export default function SongSubmissionForm() {
  const submitSong = useSubmitSong();

  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [releaseType, setReleaseType] = useState('');
  const [genre, setGenre] = useState('');
  const [artist, setArtist] = useState('');
  const [featuredArtist, setFeaturedArtist] = useState('');
  const [composer, setComposer] = useState('');
  const [producer, setProducer] = useState('');
  const [lyricist, setLyricist] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [liveStreamLink, setLiveStreamLink] = useState('');
  const [publicLink, setPublicLink] = useState('');

  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [albumTracks, setAlbumTracks] = useState<TrackMetadata[]>([]);

  const [artworkProgress, setArtworkProgress] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const isAlbum = releaseType === 'Album';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
    if (!artist.trim()) {
      toast.error('Artist name is required');
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

      const input: SubmitSongInput = {
        title,
        language,
        releaseDate: BigInt(new Date(releaseDate).getTime()) * BigInt(1000000),
        releaseType,
        genre,
        artworkBlob,
        artworkFilename: artworkFile.name,
        artist,
        featuredArtist,
        composer,
        producer,
        lyricist,
        audioBlob,
        audioFilename: audioFile?.name || 'album.mp3',
        additionalDetails,
        discountCode: discountCode.trim() ? discountCode : undefined,
        liveStreamLink: liveStreamLink.trim() ? liveStreamLink : undefined,
        albumTracks: isAlbum && albumTracks.length > 0 ? albumTracks : undefined,
        publicLink: publicLink.trim() ? publicLink : undefined,
      };

      await submitSong.mutateAsync(input);

      // Reset form
      setTitle('');
      setLanguage('');
      setReleaseDate('');
      setReleaseType('');
      setGenre('');
      setArtist('');
      setFeaturedArtist('');
      setComposer('');
      setProducer('');
      setLyricist('');
      setAdditionalDetails('');
      setDiscountCode('');
      setLiveStreamLink('');
      setPublicLink('');
      setArtworkFile(null);
      setAudioFile(null);
      setAlbumTracks([]);
      setArtworkProgress(0);
      setAudioProgress(0);
    } catch (error: any) {
      console.error('Submission error:', error);
    } finally {
      setIsUploading(false);
    }
  };

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

          {/* Artist */}
          <div>
            <Label htmlFor="artist">Artist *</Label>
            <Input
              id="artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Primary artist name"
              required
            />
          </div>

          {/* Featured Artist */}
          <div>
            <Label htmlFor="featuredArtist">Featured Artist</Label>
            <Input
              id="featuredArtist"
              value={featuredArtist}
              onChange={(e) => setFeaturedArtist(e.target.value)}
              placeholder="Featured artist (optional)"
            />
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
            <Label htmlFor="artwork">Artwork *</Label>
            <Input
              id="artwork"
              type="file"
              accept="image/*"
              onChange={(e) => setArtworkFile(e.target.files?.[0] || null)}
              required
            />
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

          <div>
            <Label htmlFor="liveStreamLink">Live Stream Link (Optional)</Label>
            <Input
              id="liveStreamLink"
              value={liveStreamLink}
              onChange={(e) => setLiveStreamLink(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label htmlFor="publicLink">Public Link (Optional)</Label>
            <Input
              id="publicLink"
              value={publicLink}
              onChange={(e) => setPublicLink(e.target.value)}
              placeholder="https://..."
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
