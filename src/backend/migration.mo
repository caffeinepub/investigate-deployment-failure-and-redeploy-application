import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Set "mo:core/Set";
import Nat "mo:core/Nat";

module {
  public type OldArtistProfile = {
    fullName : Text;
    stageName : Text;
    email : Text;
    mobileNumber : Text;
    instagramLink : Text;
    facebookLink : Text;
    spotifyProfile : Text;
    appleProfile : Text;
    profilePhoto : Blob;
    isApproved : Bool;
  };

  public type NewArtistProfile = {
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
    profilePhoto : Blob;
    isApproved : Bool;
  };

  public type OldActor = {
    artistProfiles : Map.Map<Principal, OldArtistProfile>;
  };

  public type NewActor = {
    artistProfiles : Map.Map<Text, NewArtistProfile>;
  };

  public func run(old : OldActor) : NewActor {
    let newArtistProfiles = Map.empty<Text, NewArtistProfile>();

    for ((owner, oldProfile) in old.artistProfiles.entries()) {
      let newProfileId = getNextAvailableId(newArtistProfiles, owner);

      let newProfile : NewArtistProfile = {
        id = newProfileId;
        owner;
        fullName = oldProfile.fullName;
        stageName = oldProfile.stageName;
        email = oldProfile.email;
        mobileNumber = oldProfile.mobileNumber;
        instagramLink = oldProfile.instagramLink;
        facebookLink = oldProfile.facebookLink;
        spotifyProfile = oldProfile.spotifyProfile;
        appleProfile = oldProfile.appleProfile;
        profilePhoto = oldProfile.profilePhoto;
        isApproved = oldProfile.isApproved;
      };

      newArtistProfiles.add(newProfileId, newProfile);
    };

    { artistProfiles = newArtistProfiles };
  };

  func getNextAvailableId(profiles : Map.Map<Text, NewArtistProfile>, owner : Principal) : Text {
    var counter = 1;
    let existingIds = Set.empty<Text>();
    for (profile in profiles.values()) {
      existingIds.add(profile.id);
    };

    var newId = owner.toText() # "_1";

    func idExists(id : Text) : Bool {
      existingIds.contains(id);
    };

    while (idExists(newId)) {
      counter += 1;
      newId := owner.toText() # "_" # counter.toText();
    };

    newId;
  };
};
