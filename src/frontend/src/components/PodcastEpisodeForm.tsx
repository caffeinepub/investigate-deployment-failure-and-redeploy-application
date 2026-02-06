import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Loader2, Upload } from 'lucide-react';
import { useCreatePodcastEpisode } from '../hooks/useQueries';
import { fileToExternalBlob } from '../utils/fileToExternalBlob';
import { EpisodeType } from '../backend';
import { toast } from 'sonner';

interface PodcastEpisodeFormProps {
  showId: string;
  onSuccess?: () => void;
}

export default function PodcastEpisodeForm({ showId, onSuccess }: PodcastEpisodeFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [seasonNumber, setSeasonNumber] = useState('1');
  const [episodeNumber, setEpisodeNumber] = useState('1');
  const [episodeType, setEpisodeType] = useState<string>('full');
  const [isEighteenPlus, setIsEighteenPlus] = useState(false);
  const [isExplicit, setIsExplicit] = useState(false);
  const [isPromotional, setIsPromotional] = useState(false);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string>('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const createEpisode = useCreatePodcastEpisode();

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

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter an episode title');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    if (!artworkFile) {
      toast.error('Please upload episode artwork');
      return;
    }

    if (!thumbnailFile) {
      toast.error('Please upload episode thumbnail');
      return;
    }

    if (!mediaFile) {
      toast.error('Please upload episode media file');
      return;
    }

    const season = parseInt(seasonNumber);
    const episode = parseInt(episodeNumber);

    if (isNaN(season) || season < 1) {
      toast.error('Season number must be a positive number');
      return;
    }

    if (isNaN(episode) || episode < 1) {
      toast.error('Episode number must be a positive number');
      return;
    }

    try {
      setUploadProgress(0);
      
      const artworkBlob = await fileToExternalBlob(artworkFile, (percentage) => {
        setUploadProgress(Math.floor(percentage * 0.33));
      });

      const thumbnailBlob = await fileToExternalBlob(thumbnailFile, (percentage) => {
        setUploadProgress(33 + Math.floor(percentage * 0.33));
      });

      const mediaBlob = await fileToExternalBlob(mediaFile, (percentage) => {
        setUploadProgress(66 + Math.floor(percentage * 0.34));
      });

      const episodeTypeEnum = EpisodeType[episodeType as keyof typeof EpisodeType];

      await createEpisode.mutateAsync({
        showId,
        title: title.trim(),
        description: description.trim(),
        seasonNumber: BigInt(season),
        episodeNumber: BigInt(episode),
        episodeType: episodeTypeEnum,
        isEighteenPlus,
        isExplicit,
        isPromotional,
        artwork: artworkBlob,
        thumbnail: thumbnailBlob,
        mediaFile: mediaBlob,
      });

      toast.success('Episode created successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setSeasonNumber('1');
      setEpisodeNumber('1');
      setEpisodeType('full');
      setIsEighteenPlus(false);
      setIsExplicit(false);
      setIsPromotional(false);
      setArtworkFile(null);
      setThumbnailFile(null);
      setMediaFile(null);
      setArtworkPreview('');
      setThumbnailPreview('');
      setUploadProgress(0);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Failed to create episode:', error);
      toast.error(error.message || 'Failed to create episode');
    }
  };

  const isSubmitting = createEpisode.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Episode</CardTitle>
        <CardDescription>Upload a new episode to your podcast show</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Episode Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter episode title"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this episode"
              rows={4}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seasonNumber">Season Number *</Label>
              <Input
                id="seasonNumber"
                type="number"
                min="1"
                value={seasonNumber}
                onChange={(e) => setSeasonNumber(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="episodeNumber">Episode Number *</Label>
              <Input
                id="episodeNumber"
                type="number"
                min="1"
                value={episodeNumber}
                onChange={(e) => setEpisodeNumber(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="episodeType">Episode Type *</Label>
            <Select value={episodeType} onValueChange={setEpisodeType} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Select episode type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full</SelectItem>
                <SelectItem value="trailer">Trailer</SelectItem>
                <SelectItem value="bonus">Bonus</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="eighteenPlus">18+ Only</Label>
              <Switch
                id="eighteenPlus"
                checked={isEighteenPlus}
                onCheckedChange={setIsEighteenPlus}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="explicit">Explicit Content</Label>
              <Switch
                id="explicit"
                checked={isExplicit}
                onCheckedChange={setIsExplicit}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="promotional">Promotional Content</Label>
              <Switch
                id="promotional"
                checked={isPromotional}
                onCheckedChange={setIsPromotional}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="artwork">Episode Artwork *</Label>
            <div className="flex items-center gap-4">
              {artworkPreview && (
                <img
                  src={artworkPreview}
                  alt="Artwork preview"
                  className="w-24 h-24 object-cover rounded-lg border-2 border-border"
                />
              )}
              <div className="flex-1">
                <Input
                  id="artwork"
                  type="file"
                  accept="image/*"
                  onChange={handleArtworkChange}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail">Episode Thumbnail *</Label>
            <div className="flex items-center gap-4">
              {thumbnailPreview && (
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-24 h-24 object-cover rounded-lg border-2 border-border"
                />
              )}
              <div className="flex-1">
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mediaFile">Media File (Audio/Video) *</Label>
            <Input
              id="mediaFile"
              type="file"
              accept="audio/*,video/*"
              onChange={handleMediaChange}
              disabled={isSubmitting}
              required
            />
            {mediaFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {mediaFile.name} ({(mediaFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <Label>Upload Progress</Label>
              <Progress value={uploadProgress} />
              <p className="text-sm text-muted-foreground">{uploadProgress}%</p>
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Episode...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Create Episode
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
