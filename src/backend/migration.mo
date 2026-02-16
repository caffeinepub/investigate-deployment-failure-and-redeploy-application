import Map "mo:core/Map";
import Storage "blob-storage/Storage";
import Text "mo:core/Text";

module {
  type ArtistProfile = {
    id : Text;
    owner : Principal;
    fullName : Text;
    stageName : Text;
    email : Text;
    mobileNumber : Text;
    instagramLink : Text;
    facebookLink : Text;
    spotifyProfile : Text;
    appleProfile : Text;
    youtubeChannelLink : Text;
    profilePhoto : Storage.ExternalBlob;
    profilePhotoFilename : Text;
    isApproved : Bool;
  };

  type OldActor = {
    artistProfiles : Map.Map<Text, ArtistProfile>;
  };

  type NewArtistProfile = {
    id : Text;
    owner : Principal;
    fullName : Text;
    stageName : Text;
    email : Text;
    mobileNumber : Text;
    instagramLink : Text;
    facebookLink : Text;
    spotifyProfile : Text;
    appleProfile : Text;
    youtubeChannelLink : Text;
    profilePhoto : Storage.ExternalBlob;
    profilePhotoFilename : Text;
    isApproved : Bool;
    isVerified : Bool;
  };

  type NewActor = { artistProfiles : Map.Map<Text, NewArtistProfile> };

  public func run(old : OldActor) : NewActor {
    let newArtistProfiles = old.artistProfiles.map<Text, ArtistProfile, NewArtistProfile>(
      func(_id, oldProfile) {
        { oldProfile with isVerified = false };
      }
    );
    { artistProfiles = newArtistProfiles };
  };
};
