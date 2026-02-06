import { useState } from 'react';
import { useSubmitSong, useGetDistributionFee, useGetAnnualMaintenanceFee, useGetArtistProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ExternalBlob } from '../backend';
import { Upload, Music, Image as ImageIcon, AlertCircle, UserX } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useNavigate } from '@tanstack/react-router';

interface SongSubmissionFormProps {
  onSuccess?: () => void;
}

export default function SongSubmissionForm({ onSuccess }: SongSubmissionFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    releaseType: '',
    genre: '',
    language: '',
    releaseDate: '',
    artist: '',
    featuredArtist: '',
    composer: '',
    producer: '',
    lyricist: '',
    additionalDetails: '',
    discountCode: '',
  });

  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState({ artwork: 0, audio: 0 });
  const [agreedToFee, setAgreedToFee] = useState(false);

  const submitSong = useSubmitSong();
  const { data: distributionFee } = useGetDistributionFee();
  const { data: annualMaintenanceFee } = useGetAnnualMaintenanceFee();
  const { data: artistProfile, isLoading: profileLoading } = useGetArtistProfile();
  const navigate = useNavigate();

  const distributionFeeAmount = distributionFee ? Number(distributionFee) : 199;
  const annualMaintenanceFeeAmount = annualMaintenanceFee ? Number(annualMaintenanceFee) : 1000;

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

    if (!artworkFile || !audioFile || !agreedToFee || !formData.language || !formData.releaseDate) {
      return;
    }

    try {
      const artworkBytes = new Uint8Array(await artworkFile.arrayBuffer());
      const audioBytes = new Uint8Array(await audioFile.arrayBuffer());

      const artworkBlob = ExternalBlob.fromBytes(artworkBytes).withUploadProgress((percentage) => {
        setUploadProgress((prev) => ({ ...prev, artwork: percentage }));
      });

      const audioBlob = ExternalBlob.fromBytes(audioBytes).withUploadProgress((percentage) => {
        setUploadProgress((prev) => ({ ...prev, audio: percentage }));
      });

      // Convert release date to nanoseconds timestamp
      const releaseDateTimestamp = BigInt(new Date(formData.releaseDate).getTime() * 1000000);

      await submitSong.mutateAsync({
        ...formData,
        releaseDate: releaseDateTimestamp,
        artworkBlob,
        artworkFilename: artworkFile.name,
        audioBlob,
        audioFilename: audioFile.name,
        discountCode: formData.discountCode.trim() || undefined,
      });

      // Reset form
      setFormData({
        title: '',
        releaseType: '',
        genre: '',
        language: '',
        releaseDate: '',
        artist: '',
        featuredArtist: '',
        composer: '',
        producer: '',
        lyricist: '',
        additionalDetails: '',
        discountCode: '',
      });
      setArtworkFile(null);
      setAudioFile(null);
      setArtworkPreview('');
      setUploadProgress({ artwork: 0, audio: 0 });
      setAgreedToFee(false);

      // Navigate to thank you page
      navigate({ to: '/thank-you' });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const isUploading = uploadProgress.artwork > 0 || uploadProgress.audio > 0;

  // Check if artist profile is incomplete
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!artistProfile) {
    return (
      <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
        <UserX className="h-5 w-5" />
        <AlertTitle className="text-lg font-semibold mb-2">Profile Required</AlertTitle>
        <AlertDescription className="text-base">
          Please complete your artist profile before submitting songs. You can set up your profile by clicking the "Edit Profile" button in your dashboard header.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <Alert className="border-amber-500/50 bg-amber-500/10">
        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
        <AlertDescription className="text-xs sm:text-sm">
          <strong>Fee Policy:</strong> A distribution fee of ₹{distributionFeeAmount} will be charged per release, and an annual maintenance fee of ₹{annualMaintenanceFeeAmount} for data maintenance.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm sm:text-base">Song Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter song title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="releaseType" className="text-sm sm:text-base">Release Type *</Label>
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
          <Label htmlFor="genre" className="text-sm sm:text-base">Genre *</Label>
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
          <Label htmlFor="language" className="text-sm sm:text-base">Language *</Label>
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
          <Label htmlFor="releaseDate" className="text-sm sm:text-base">Release Date *</Label>
          <Input
            id="releaseDate"
            type="date"
            value={formData.releaseDate}
            onChange={(e) => handleInputChange('releaseDate', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="artist" className="text-sm sm:text-base">Artist Name *</Label>
          <Input
            id="artist"
            value={formData.artist}
            onChange={(e) => handleInputChange('artist', e.target.value)}
            placeholder="Enter artist name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="featuredArtist" className="text-sm sm:text-base">Featured Artist</Label>
          <Input
            id="featuredArtist"
            value={formData.featuredArtist}
            onChange={(e) => handleInputChange('featuredArtist', e.target.value)}
            placeholder="Enter featured artist (optional)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="composer" className="text-sm sm:text-base">Composer</Label>
          <Input
            id="composer"
            value={formData.composer}
            onChange={(e) => handleInputChange('composer', e.target.value)}
            placeholder="Enter composer name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="producer" className="text-sm sm:text-base">Producer</Label>
          <Input
            id="producer"
            value={formData.producer}
            onChange={(e) => handleInputChange('producer', e.target.value)}
            placeholder="Enter producer name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lyricist" className="text-sm sm:text-base">Lyricist</Label>
          <Input
            id="lyricist"
            value={formData.lyricist}
            onChange={(e) => handleInputChange('lyricist', e.target.value)}
            placeholder="Enter lyricist name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="discountCode" className="text-sm sm:text-base">Discount Code (optional)</Label>
          <Input
            id="discountCode"
            value={formData.discountCode}
            onChange={(e) => handleInputChange('discountCode', e.target.value)}
            placeholder="Enter discount code if you have one"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="additionalDetails" className="text-sm sm:text-base">Additional Details</Label>
        <Textarea
          id="additionalDetails"
          value={formData.additionalDetails}
          onChange={(e) => handleInputChange('additionalDetails', e.target.value)}
          placeholder="Any additional information about your track..."
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-2">
          <Label htmlFor="artwork" className="text-sm sm:text-base">Artwork *</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-4 sm:p-6 text-center hover:border-primary/50 transition-colors">
            {artworkPreview ? (
              <div className="space-y-4">
                <img src={artworkPreview} alt="Artwork preview" className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-lg object-cover" />
                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('artwork')?.click()}>
                  Change Artwork
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground" />
                <div>
                  <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('artwork')?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Artwork
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">PNG, JPG up to 10MB</p>
                </div>
              </div>
            )}
            <input
              id="artwork"
              type="file"
              accept="image/*"
              onChange={handleArtworkChange}
              className="hidden"
              required
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
          <Label htmlFor="audio" className="text-sm sm:text-base">Audio File *</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-4 sm:p-6 text-center hover:border-primary/50 transition-colors">
            {audioFile ? (
              <div className="space-y-4">
                <Music className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-green-500" />
                <div>
                  <p className="font-medium text-sm break-all">{audioFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('audio')?.click()}>
                  Change File
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Music className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground" />
                <div>
                  <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('audio')?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Audio
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">MP3, WAV, FLAC up to 100MB</p>
                </div>
              </div>
            )}
            <input
              id="audio"
              type="file"
              accept="audio/*"
              onChange={handleAudioChange}
              className="hidden"
              required
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

      <div className="flex items-start space-x-3 rounded-lg border border-border p-3 sm:p-4 bg-muted/30">
        <Checkbox
          id="feeAgreement"
          checked={agreedToFee}
          onCheckedChange={(checked) => setAgreedToFee(checked === true)}
          required
        />
        <div className="space-y-1 leading-none">
          <Label
            htmlFor="feeAgreement"
            className="text-sm sm:text-base font-medium cursor-pointer"
          >
            I understand that a distribution fee of ₹{distributionFeeAmount} will be charged per release and an annual maintenance fee of ₹{annualMaintenanceFeeAmount} for data maintenance. *
          </Label>
        </div>
      </div>

      <Button type="submit" className="w-full text-sm sm:text-base" disabled={submitSong.isPending || isUploading || !agreedToFee}>
        {submitSong.isPending || isUploading ? 'Submitting...' : 'Submit Song'}
      </Button>
    </form>
  );
}
