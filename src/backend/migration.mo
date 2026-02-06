import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import Time "mo:core/Time";

module {
  type OldSongSubmission = {
    id : Text;
    title : Text;
    releaseType : Text;
    genre : Text;
    language : Text;
    releaseDate : Time.Time;
    artwork : Storage.ExternalBlob;
    artworkFilename : Text;
    artist : Text;
    featuredArtist : Text;
    composer : Text;
    producer : Text;
    lyricist : Text;
    audioFile : Storage.ExternalBlob;
    audioFilename : Text;
    additionalDetails : Text;
    status : { #pending; #approved; #rejected; #draft };
    adminRemarks : Text;
    adminComment : Text;
    submitter : Principal;
    timestamp : Time.Time;
    discountCode : ?Text;
    acrResult : ?{
      statusCode : Text;
      music : Text;
    };
    preSaveLink : ?Text;
  };

  type OldVerificationRequest = {
    id : Text;
    user : Principal;
    status : { #pending; #approved; #rejected; #waiting };
    timestamp : Time.Time;
    verificationApprovedTimestamp : ?Time.Time;
    expiryExtensionDays : Nat;
  };

  type OldBlogPost = {
    id : Text;
    title : Text;
    content : Text;
    author : Principal;
    timestamp : Time.Time;
    media : ?Storage.ExternalBlob;
    status : { #draft; #published };
  };

  type OldActor = {
    submissions : Map.Map<Text, OldSongSubmission>;
    userProfiles : Map.Map<Principal, { name : Text; artistId : Text }>;
    artistProfiles : Map.Map<Principal, {
      fullName : Text;
      stageName : Text;
      email : Text;
      mobileNumber : Text;
      instagramLink : Text;
      facebookLink : Text;
      spotifyProfile : Text;
      appleProfile : Text;
      profilePhoto : Storage.ExternalBlob;
      isApproved : Bool;
    }>;
    verificationRequests : Map.Map<Text, OldVerificationRequest>;
    teamMembers : Map.Map<Principal, Bool>;
    blogPosts : Map.Map<Text, OldBlogPost>;
    communityMessages : Map.Map<Text, {
      id : Text;
      user : Principal;
      content : Text;
      timestamp : Time.Time;
      role : Text;
      fullName : Text;
    }>;
    verificationRequestsWithFullName : Map.Map<Text, {
      id : Text;
      user : Principal;
      status : { #pending; #approved; #rejected; #waiting };
      timestamp : Time.Time;
      fullName : Text;
      verificationApprovedTimestamp : ?Time.Time;
      expiryExtensionDays : Nat;
    }>;
    distributionFee : Int;
    annualMaintenanceFee : Int;
    stripeConfiguration : ?{
      secretKey : Text;
      allowedCountries : [Text];
    };
    globalAnnouncement : Text;
    lastVerificationCheckTime : Time.Time;
    artistProfileEditingAccessEnabled : Bool;
  };

  type NewActor = {
    submissions : Map.Map<Text, OldSongSubmission>;
    userProfiles : Map.Map<Principal, { name : Text; artistId : Text }>;
    artistProfiles : Map.Map<Principal, {
      fullName : Text;
      stageName : Text;
      email : Text;
      mobileNumber : Text;
      instagramLink : Text;
      facebookLink : Text;
      spotifyProfile : Text;
      appleProfile : Text;
      profilePhoto : Storage.ExternalBlob;
      isApproved : Bool;
    }>;
    verificationRequests : Map.Map<Text, OldVerificationRequest>;
    teamMembers : Map.Map<Principal, Bool>;
    blogPosts : Map.Map<Text, OldBlogPost>;
    communityMessages : Map.Map<Text, {
      id : Text;
      user : Principal;
      content : Text;
      timestamp : Time.Time;
      role : Text;
      fullName : Text;
    }>;
    distributionFee : Int;
    annualMaintenanceFee : Int;
    stripeConfiguration : ?{
      secretKey : Text;
      allowedCountries : [Text];
    };
    globalAnnouncement : Text;
    lastVerificationCheckTime : Time.Time;
    artistProfileEditingAccessEnabled : Bool;
  };

  public func run(old : OldActor) : NewActor {
    {
      submissions = old.submissions;
      userProfiles = old.userProfiles;
      artistProfiles = old.artistProfiles;
      verificationRequests = old.verificationRequests;
      teamMembers = old.teamMembers;
      blogPosts = old.blogPosts;
      communityMessages = old.communityMessages;
      distributionFee = old.distributionFee;
      annualMaintenanceFee = old.annualMaintenanceFee;
      stripeConfiguration = old.stripeConfiguration;
      globalAnnouncement = old.globalAnnouncement;
      lastVerificationCheckTime = old.lastVerificationCheckTime;
      artistProfileEditingAccessEnabled = old.artistProfileEditingAccessEnabled;
    };
  };
};
