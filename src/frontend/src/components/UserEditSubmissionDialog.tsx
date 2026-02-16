import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEditSongSubmission, useGetMyArtistProfiles } from '../hooks/useQueries';
import { fileToExternalBlob } from '../utils/fileToExternalBlob';
import { SongSubmission, TrackMetadata, ExternalBlob } from '../backend';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import AlbumTracksEditor from './AlbumTracksEditor';
import { Progress } from '@/components/ui/progress';

interface UserEditSubmissionDialogProps {
  submission: SongSubmission;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserEditSubmissionDialog({ submission, open, onOpenChange }: UserEditSubmissionDialogProps) {
  const editSubmission = useEditSongSubmission();
  const { data: artistProfiles } = useGetMyArtistProfiles();

  const [title, setTitle] = useState(submission.title);
  const [language, setLanguage] = useState(submission.language);
  const [releaseDate, setReleaseDate] = useState(
    new Date(Number(submission.releaseDate / BigInt(1000000))).toISOString().split('T')[0]
  );
  const [releaseType, setReleaseType] = useState(submission.releaseType);
  const [genre, setGenre] = useState(submission.genre);
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [selectedFeaturedArtists, setSelectedFeaturedArtists] = useState<string[]>([]);
  const [composer, setComposer] = useState(submission.composer);
  const [producer, setProducer] = useState(submission.producer);
  const [lyricist, setLyricist] = useState(submission.lyricist);
  const [additionalDetails, setAdditionalDetails] = useState(submission.additionalDetails);
  const [discountCode, setDiscountCode] = useState(submission.discountCode || '');
  const [musicVideoLink, setMusicVideoLink] = useState(submission.musicVideoLink || '');

  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [albumTracks, setAlbumTracks] = useState<TrackMetadata[]>(submission.albumTracks || []);

  const [artworkProgress, setArtworkProgress] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [artworkError, setArtworkError] = useState('');

  const isAlbum = releaseType === 'Album';

  useEffect(() => {
    if (artistProfiles && artistProfiles.length > 0) {
      const artistNames = submission.artist.split(',').map((n) => n.trim());
      const featuredNames = submission.featuredArtist.split(',').map((n) => n.trim()).filter(Boolean);
      
      const matchedArtists = artistProfiles
        .filter((p) => artistNames.includes(p.stageName) || artistNames.includes(p.fullName))
        .map((p) => p.id);
      
      const matchedFeatured = artistProfiles
        .filter((p) => featuredNames.includes(p.stageName) || featuredNames.includes(p.fullName))
        .map((p) => p.id);
      
      setSelectedArtists(matchedArtists);
      setSelectedFeaturedArtists(matchedFeatured);
    }
  }, [artistProfiles, submission.artist, submission.featuredArtist]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedArtists.length === 0) {
      toast.error('At least one artist must be selected');
      return;
    }

    if (artworkError) {
      toast.error(artworkError);
      return;
    }

    if (isAlbum && albumTracks.length === 0) {
      toast.error('At least one album track is required');
      return;
    }

    try {
      setIsUploading(true);

      let artworkBlob: ExternalBlob = submission.artwork;
      if (artworkFile) {
        artworkBlob = await fileToExternalBlob(artworkFile, (progress) => {
          setArtworkProgress(progress);
        });
      }

      let audioBlob: ExternalBlob = submission.audioFile;
      if (!isAlbum && audioFile) {
        audioBlob = await fileToExternalBlob(audioFile, (progress) => {
          setAudioProgress(progress);
        });
      }

      const artistNames = selectedArtists
        .map((id) => artistProfiles?.find((p) => p.id === id)?.stageName)
        .filter(Boolean)
        .join(', ');

      const featuredNames = selectedFeaturedArtists
        .map((id) => artistProfiles?.find((p) => p.id === id)?.stageName)
        .filter(Boolean)
        .join(', ');

      await editSubmission.mutateAsync({
        songSubmissionId: submission.id,
        title,
        releaseType,
        genre,
        language,
        releaseDate: BigInt(new Date(releaseDate).getTime()) * BigInt(1000000),
        artworkBlob,
        artworkFilename: artworkFile?.name || submission.artworkFilename,
        artist: artistNames,
        featuredArtist: featuredNames,
        composer,
        producer,
        lyricist,
        audioFile: audioBlob,
        audioFilename: audioFile?.name || submission.audioFilename,
        additionalDetails,
        discountCode: discountCode.trim() ? discountCode : undefined,
        musicVideoLink: musicVideoLink.trim() ? musicVideoLink : undefined,
        albumTracks: isAlbum && albumTracks.length > 0 ? albumTracks : undefined,
      });

      setArtworkProgress(0);
      setAudioProgress(0);
      onOpenChange(false);
    } catch (error) {
      console.error('Edit submission error:', error);
      setArtworkProgress(0);
      setAudioProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Submission</DialogTitle>
          <DialogDescription>Update your song submission details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="language">Language *</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
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

            <div>
              <Label htmlFor="releaseType">Release Type *</Label>
              <Select value={releaseType} onValueChange={setReleaseType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Single">Single</SelectItem>
                  <SelectItem value="Album">Album</SelectItem>
                  <SelectItem value="EP">EP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="genre">Genre *</Label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger>
                  <SelectValue />
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
          </div>

          {artistProfiles && artistProfiles.length > 0 && (
            <>
              <div>
                <Label>Artist(s) *</Label>
                <div className="border rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
                  {artistProfiles.map((profile) => (
                    <div key={profile.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`edit-artist-${profile.id}`}
                        checked={selectedArtists.includes(profile.id)}
                        onChange={() => toggleArtistSelection(profile.id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <label htmlFor={`edit-artist-${profile.id}`} className="text-sm cursor-pointer flex-1">
                        {profile.stageName}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Featured Artist(s) (Optional)</Label>
                <div className="border rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
                  {artistProfiles.map((profile) => (
                    <div key={profile.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`edit-featured-${profile.id}`}
                        checked={selectedFeaturedArtists.includes(profile.id)}
                        onChange={() => toggleFeaturedArtistSelection(profile.id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <label htmlFor={`edit-featured-${profile.id}`} className="text-sm cursor-pointer flex-1">
                        {profile.stageName}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="composer">Composer *</Label>
              <Input
                id="composer"
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="producer">Producer *</Label>
              <Input
                id="producer"
                value={producer}
                onChange={(e) => setProducer(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="lyricist">Lyricist *</Label>
              <Input
                id="lyricist"
                value={lyricist}
                onChange={(e) => setLyricist(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="artwork">Artwork (JPG/PNG, 3000×3000 pixels)</Label>
            <Input
              id="artwork"
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleArtworkChange}
            />
            {artworkError && (
              <p className="text-sm text-destructive mt-1">{artworkError}</p>
            )}
            {artworkProgress > 0 && artworkProgress < 100 && (
              <Progress value={artworkProgress} className="mt-2" />
            )}
          </div>

          {!isAlbum && (
            <div>
              <Label htmlFor="audio">Audio File (Optional - leave empty to keep current)</Label>
              <Input
                id="audio"
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              />
              {audioProgress > 0 && audioProgress < 100 && (
                <Progress value={audioProgress} className="mt-2" />
              )}
            </div>
          )}

          {isAlbum && (
            <div>
              <Label>Album Tracks *</Label>
              <AlbumTracksEditor tracks={albumTracks} onChange={setAlbumTracks} />
            </div>
          )}

          <div>
            <Label htmlFor="musicVideoLink">Music Video Link (Optional)</Label>
            <Input
              id="musicVideoLink"
              value={musicVideoLink}
              onChange={(e) => setMusicVideoLink(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label htmlFor="additionalDetails">Additional Details</Label>
            <Textarea
              id="additionalDetails"
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="discountCode">Discount Code (Optional)</Label>
            <Input
              id="discountCode"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading || editSubmission.isPending}
            >
              {isUploading || editSubmission.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
