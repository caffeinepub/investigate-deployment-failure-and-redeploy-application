import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { useCreatePodcastShow } from '../hooks/useQueries';
import { fileToExternalBlob } from '../utils/fileToExternalBlob';
import { PodcastType, PodcastCategory, Language } from '../backend';
import { toast } from 'sonner';

interface PodcastShowFormProps {
  onSuccess?: () => void;
}

export default function PodcastShowForm({ onSuccess }: PodcastShowFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [podcastType, setPodcastType] = useState<'audio' | 'video'>('audio');
  const [category, setCategory] = useState<string>('');
  const [language, setLanguage] = useState<string>('');
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const createShow = useCreatePodcastShow();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a show title');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    if (!category) {
      toast.error('Please select a category');
      return;
    }

    if (!language) {
      toast.error('Please select a language');
      return;
    }

    if (!artworkFile) {
      toast.error('Please upload show artwork');
      return;
    }

    try {
      setUploadProgress(0);
      const artworkBlob = await fileToExternalBlob(artworkFile, (percentage) => {
        setUploadProgress(percentage);
      });

      const podcastTypeEnum: PodcastType = podcastType === 'audio' ? PodcastType.audio : PodcastType.video;
      const categoryEnum = PodcastCategory[category as keyof typeof PodcastCategory];
      const languageEnum = Language[language as keyof typeof Language];

      await createShow.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        podcastType: podcastTypeEnum,
        category: categoryEnum,
        language: languageEnum,
        artwork: artworkBlob,
      });

      toast.success('Podcast show created successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setPodcastType('audio');
      setCategory('');
      setLanguage('');
      setArtworkFile(null);
      setArtworkPreview('');
      setUploadProgress(0);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Failed to create podcast show:', error);
      toast.error(error.message || 'Failed to create podcast show');
    }
  };

  const isSubmitting = createShow.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Podcast Show</CardTitle>
        <CardDescription>Set up your podcast show details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Show Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter show title"
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
              placeholder="Describe your podcast show"
              rows={4}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="podcastType">Podcast Type *</Label>
            <Select value={podcastType} onValueChange={(value: 'audio' | 'video') => setPodcastType(value)} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Select podcast type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="arts">Arts</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="comedy">Comedy</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="healthFitness">Health & Fitness</SelectItem>
                <SelectItem value="kidsFamily">Kids & Family</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="newsPolitics">News & Politics</SelectItem>
                <SelectItem value="religionSpirituality">Religion & Spirituality</SelectItem>
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="tvFilm">TV & Film</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language *</Label>
            <Select value={language} onValueChange={setLanguage} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
                <SelectItem value="tamil">Tamil</SelectItem>
                <SelectItem value="telugu">Telugu</SelectItem>
                <SelectItem value="kannada">Kannada</SelectItem>
                <SelectItem value="malayalam">Malayalam</SelectItem>
                <SelectItem value="punjabi">Punjabi</SelectItem>
                <SelectItem value="bengali">Bengali</SelectItem>
                <SelectItem value="marathi">Marathi</SelectItem>
                <SelectItem value="gujarati">Gujarati</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="artwork">Show Artwork *</Label>
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
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a square image (recommended: 3000x3000px)
                </p>
              </div>
            </div>
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
                Creating Show...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Create Show
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
