import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminEditSubmission } from '../hooks/useQueries';
import { SongSubmission, ExternalBlob } from '../backend';
import { Upload, Music, Image as ImageIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AdminEditSubmissionDialogProps {
  submission: SongSubmission;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AdminEditSubmissionDialog({ submission, open, onOpenChange }: AdminEditSubmissionDialogProps) {
  const [formData, setFormData] = useState({
    title: submission.title,
    releaseType: submission.releaseType,
    genre: submission.genre,
    language: submission.language,
    releaseDate: new Date(Number(submission.releaseDate / BigInt(1000000))).toISOString().split('T')[0],
    artist: submission.artist,
    featuredArtist: submission.featuredArtist,
    composer: submission.composer,
    producer: submission.producer,
    lyricist: submission.lyricist,
    additionalDetails: submission.additionalDetails,
  });

  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string>(submission.artwork.getDirectURL());
  const [uploadProgress, setUploadProgress] = useState({ artwork: 0, audio: 0 });

  const editSubmission = useAdminEditSubmission();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArtworkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArtworkFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setArtworkPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let artworkBlob = submission.artwork;
      let audioBlob = submission.audioFile;

      if (artworkFile) {
        const artworkBytes = new Uint8Array(await artworkFile.arrayBuffer());
        artworkBlob = ExternalBlob.fromBytes(artworkBytes).withUploadProgress((percentage) => {
          setUploadProgress((prev) => ({ ...prev, artwork: percentage }));
        });
      }

      if (audioFile) {
        const audioBytes = new Uint8Array(await audioFile.arrayBuffer());
        audioBlob = ExternalBlob.fromBytes(audioBytes).withUploadProgress((percentage) => {
          setUploadProgress((prev) => ({ ...prev, audio: percentage }));
        });
      }

      // Convert release date to nanoseconds timestamp
      const releaseDateTimestamp = BigInt(new Date(formData.releaseDate).getTime() * 1000000);

      const updatedSubmission: SongSubmission = {
        ...submission,
        ...formData,
        releaseDate: releaseDateTimestamp,
        artwork: artworkBlob,
        audioFile: audioBlob,
      };

      await editSubmission.mutateAsync(updatedSubmission);
      setUploadProgress({ artwork: 0, audio: 0 });
      onOpenChange(false);
    } catch (error) {
      console.error('Edit submission error:', error);
      setUploadProgress({ artwork: 0, audio: 0 });
    }
  };

  const isUploading = uploadProgress.artwork > 0 || uploadProgress.audio > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Submission</DialogTitle>
          <DialogDescription>Update the submission details below</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Song Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter song title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="releaseType">Release Type *</Label>
              <Select value={formData.releaseType} onValueChange={(value) => handleInputChange('releaseType', value)}>
                <SelectTrigger id="releaseType">
                  <SelectValue placeholder="Select release type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="ep">EP</SelectItem>
                  <SelectItem value="album">Album</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre">Genre *</Label>
              <Select value={formData.genre} onValueChange={(value) => handleInputChange('genre', value)}>
                <SelectTrigger id="genre">
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pop">Pop</SelectItem>
                  <SelectItem value="rock">Rock</SelectItem>
                  <SelectItem value="hip-hop">Hip Hop</SelectItem>
                  <SelectItem value="electronic">Electronic</SelectItem>
                  <SelectItem value="jazz">Jazz</SelectItem>
                  <SelectItem value="classical">Classical</SelectItem>
                  <SelectItem value="country">Country</SelectItem>
                  <SelectItem value="r&b">R&B</SelectItem>
                  <SelectItem value="indie">Indie</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language *</Label>
              <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tamil">Tamil</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Hindi">Hindi</SelectItem>
                  <SelectItem value="Telugu">Telugu</SelectItem>
                  <SelectItem value="Malayalam">Malayalam</SelectItem>
                  <SelectItem value="Kannada">Kannada</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="releaseDate">Release Date *</Label>
              <Input
                id="releaseDate"
                type="date"
                value={formData.releaseDate}
                onChange={(e) => handleInputChange('releaseDate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist">Artist Name *</Label>
              <Input
                id="artist"
                value={formData.artist}
                onChange={(e) => handleInputChange('artist', e.target.value)}
                placeholder="Enter artist name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="featuredArtist">Featured Artist</Label>
              <Input
                id="featuredArtist"
                value={formData.featuredArtist}
                onChange={(e) => handleInputChange('featuredArtist', e.target.value)}
                placeholder="Enter featured artist (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="composer">Composer</Label>
              <Input
                id="composer"
                value={formData.composer}
                onChange={(e) => handleInputChange('composer', e.target.value)}
                placeholder="Enter composer name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="producer">Producer</Label>
              <Input
                id="producer"
                value={formData.producer}
                onChange={(e) => handleInputChange('producer', e.target.value)}
                placeholder="Enter producer name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lyricist">Lyricist</Label>
              <Input
                id="lyricist"
                value={formData.lyricist}
                onChange={(e) => handleInputChange('lyricist', e.target.value)}
                placeholder="Enter lyricist name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalDetails">Additional Details</Label>
            <Textarea
              id="additionalDetails"
              value={formData.additionalDetails}
              onChange={(e) => handleInputChange('additionalDetails', e.target.value)}
              placeholder="Any additional information about your track..."
              rows={4}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="artwork">Artwork</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                <img src={artworkPreview} alt="Artwork preview" className="w-24 h-24 mx-auto rounded-lg object-cover mb-3" />
                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('artwork')?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Change Artwork
                </Button>
                <input
                  id="artwork"
                  type="file"
                  accept="image/*"
                  onChange={handleArtworkChange}
                  className="hidden"
                />
              </div>
              {uploadProgress.artwork > 0 && uploadProgress.artwork < 100 && (
                <div className="space-y-1">
                  <Progress value={uploadProgress.artwork} />
                  <p className="text-xs text-muted-foreground text-center">Uploading artwork: {uploadProgress.artwork}%</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="audio">Audio File</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                <Music className="w-12 h-12 mx-auto text-green-500 mb-3" />
                <p className="text-sm mb-3">{audioFile ? audioFile.name : 'Current audio file'}</p>
                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('audio')?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Change Audio
                </Button>
                <input
                  id="audio"
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioChange}
                  className="hidden"
                />
              </div>
              {uploadProgress.audio > 0 && uploadProgress.audio < 100 && (
                <div className="space-y-1">
                  <Progress value={uploadProgress.audio} />
                  <p className="text-xs text-muted-foreground text-center">Uploading audio: {uploadProgress.audio}%</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={editSubmission.isPending || isUploading}>
              {editSubmission.isPending || isUploading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
