import { useState, useEffect } from 'react';
import { useSaveArtistProfile, useUpdateArtistProfile, useGetArtistProfileEditingAccessStatus } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalBlob } from '../backend';
import { Upload, User, Lock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ArtistSetupFormProps {
  onSuccess?: () => void;
  initialData?: any;
  isEditing?: boolean;
}

export default function ArtistSetupForm({ onSuccess, initialData, isEditing = false }: ArtistSetupFormProps) {
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || '',
    stageName: initialData?.stageName || '',
    email: initialData?.email || '',
    mobileNumber: initialData?.mobileNumber || '',
    instagramLink: initialData?.instagramLink || '',
    facebookLink: initialData?.facebookLink || '',
    spotifyProfile: initialData?.spotifyProfile || '',
    appleProfile: initialData?.appleProfile || '',
  });

  const [hasSpotifyProfile, setHasSpotifyProfile] = useState(!!initialData?.spotifyProfile);
  const [hasAppleProfile, setHasAppleProfile] = useState(!!initialData?.appleProfile);

  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(
    initialData?.profilePhoto ? initialData.profilePhoto.getDirectURL() : ''
  );
  const [uploadProgress, setUploadProgress] = useState(0);

  const saveProfile = useSaveArtistProfile();
  const updateProfile = useUpdateArtistProfile();
  const { data: editingEnabled, isLoading: editingStatusLoading } = useGetArtistProfileEditingAccessStatus();

  const isApproved = initialData?.isApproved || false;
  const isEditingDisabled = isEditing && (isApproved || editingEnabled === false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSpotifyCheckboxChange = (checked: boolean) => {
    setHasSpotifyProfile(checked);
    if (!checked) {
      setFormData((prev) => ({ ...prev, spotifyProfile: '' }));
    }
  };

  const handleAppleCheckboxChange = (checked: boolean) => {
    setHasAppleProfile(checked);
    if (!checked) {
      setFormData((prev) => ({ ...prev, appleProfile: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profilePhotoFile && !initialData?.profilePhoto) {
      return;
    }

    try {
      let profilePhotoBlob: any;

      if (profilePhotoFile) {
        const photoBytes = new Uint8Array(await profilePhotoFile.arrayBuffer());
        profilePhotoBlob = ExternalBlob.fromBytes(photoBytes).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      } else {
        profilePhotoBlob = initialData.profilePhoto;
      }

      const profileInput = {
        ...formData,
        profilePhoto: profilePhotoBlob,
        isApproved: initialData?.isApproved || false,
      };

      if (isEditing) {
        await updateProfile.mutateAsync(profileInput);
      } else {
        await saveProfile.mutateAsync(profileInput);
      }

      setUploadProgress(0);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Profile save error:', error);
      setUploadProgress(0);
    }
  };

  const isUploading = uploadProgress > 0 && uploadProgress < 100;

  if (editingStatusLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isEditingDisabled) {
    const message = isApproved
      ? 'Your artist profile has been approved by admin and cannot be edited. Please contact support if you need to make changes.'
      : 'Profile editing has been disabled by the administrator. Please contact support if you need to make changes.';

    return (
      <div className="space-y-6">
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <Lock className="h-5 w-5 text-amber-600" />
          <AlertDescription className="text-base">{message}</AlertDescription>
        </Alert>

        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-6 h-6" />
              Artist Profile (Read-Only)
            </CardTitle>
            <CardDescription>Your profile information is currently locked</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Profile Photo</Label>
              <div className="flex justify-center">
                <img
                  src={photoPreview}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={formData.fullName} disabled />
              </div>

              <div className="space-y-2">
                <Label>Stage Name</Label>
                <Input value={formData.stageName} disabled />
              </div>

              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input value={formData.email} disabled />
              </div>

              <div className="space-y-2">
                <Label>Mobile Number</Label>
                <Input value={formData.mobileNumber} disabled />
              </div>

              <div className="space-y-2">
                <Label>Instagram Link</Label>
                <Input value={formData.instagramLink || 'Not provided'} disabled />
              </div>

              <div className="space-y-2">
                <Label>Facebook Link</Label>
                <Input value={formData.facebookLink || 'Not provided'} disabled />
              </div>
            </div>

            {hasSpotifyProfile && (
              <div className="space-y-2">
                <Label>Spotify Profile</Label>
                <Input value={formData.spotifyProfile} disabled />
              </div>
            )}

            {hasAppleProfile && (
              <div className="space-y-2">
                <Label>Apple Music Profile</Label>
                <Input value={formData.appleProfile} disabled />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-6 h-6" />
          {isEditing ? 'Edit Artist Profile' : 'Complete Your Artist Profile'}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? 'Update your artist information'
            : 'Please complete your artist profile before submitting songs'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="profilePhoto">Profile Photo *</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              {photoPreview ? (
                <div className="space-y-4">
                  <img
                    src={photoPreview}
                    alt="Profile preview"
                    className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-primary/20"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('profilePhoto')?.click()}
                  >
                    Change Photo
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <User className="w-12 h-12 mx-auto text-muted-foreground" />
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('profilePhoto')?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              )}
              <input
                id="profilePhoto"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
                required={!initialData?.profilePhoto}
              />
            </div>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-1">
                <Progress value={uploadProgress} />
                <p className="text-xs text-muted-foreground text-center">Uploading: {uploadProgress}%</p>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stageName">Stage Name *</Label>
              <Input
                id="stageName"
                value={formData.stageName}
                onChange={(e) => handleInputChange('stageName', e.target.value)}
                placeholder="Enter your stage name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number *</Label>
              <Input
                id="mobileNumber"
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                placeholder="+1 234 567 8900"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagramLink">Instagram Link</Label>
              <Input
                id="instagramLink"
                value={formData.instagramLink}
                onChange={(e) => handleInputChange('instagramLink', e.target.value)}
                placeholder="https://instagram.com/yourprofile"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebookLink">Facebook Link</Label>
              <Input
                id="facebookLink"
                value={formData.facebookLink}
                onChange={(e) => handleInputChange('facebookLink', e.target.value)}
                placeholder="https://facebook.com/yourprofile"
              />
            </div>
          </div>

          <div className="space-y-4 border-t pt-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasSpotifyProfile"
                  checked={hasSpotifyProfile}
                  onCheckedChange={handleSpotifyCheckboxChange}
                />
                <Label
                  htmlFor="hasSpotifyProfile"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Existing Artist with Spotify Profile
                </Label>
              </div>

              {hasSpotifyProfile && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="spotifyProfile">Spotify Artist Profile Link *</Label>
                  <Input
                    id="spotifyProfile"
                    value={formData.spotifyProfile}
                    onChange={(e) => handleInputChange('spotifyProfile', e.target.value)}
                    placeholder="https://open.spotify.com/artist/..."
                    required={hasSpotifyProfile}
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasAppleProfile"
                  checked={hasAppleProfile}
                  onCheckedChange={handleAppleCheckboxChange}
                />
                <Label
                  htmlFor="hasAppleProfile"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Existing Artist with Apple Music Profile
                </Label>
              </div>

              {hasAppleProfile && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="appleProfile">Apple Music Profile Link *</Label>
                  <Input
                    id="appleProfile"
                    value={formData.appleProfile}
                    onChange={(e) => handleInputChange('appleProfile', e.target.value)}
                    placeholder="https://music.apple.com/artist/..."
                    required={hasAppleProfile}
                  />
                </div>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={saveProfile.isPending || updateProfile.isPending || isUploading}>
            {saveProfile.isPending || updateProfile.isPending || isUploading ? 'Saving...' : isEditing ? 'Update Profile' : 'Complete Setup'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
