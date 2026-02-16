import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";
import Time "mo:core/Time";

module {
  type SongStatus = {
    #pending;
    #approved;
    #rejected;
    #draft;
    #live;
  };

  type AlbumTrack = {
    trackName : Text;
    albumName : Text;
    artistName : Text;
    audioFile : Storage.ExternalBlob;
    composer : Text;
    producer : Text;
    featuredArtist : Text;
    lyricist : Text;
  };

  type TrackMetadata = {
    title : Text;
    artist : Text;
    featuredArtist : Text;
    composer : Text;
    producer : Text;
    lyricist : Text;
    audioFile : Storage.ExternalBlob;
    audioFilename : Text;
  };

  type SongSubmission = {
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
    status : SongStatus;
    adminRemarks : Text;
    adminComment : Text;
    submitter : Principal;
    timestamp : Time.Time;
    discountCode : ?Text;
    acrResult : ?ACRResult;
    preSaveLink : ?Text;
    liveStreamLink : ?Text;
    musicVideoLink : ?Text;
    albumTracks : ?[TrackMetadata];
    publicLink : ?Text;
    adminLiveLink : ?Text;
    isManuallyRejected : Bool;
  };

  type ACRResult = {
    statusCode : Text;
    music : Text;
  };

  type VerificationStatus = {
    #pending;
    #approved;
    #rejected;
    #waiting;
  };

  type VerificationRequest = {
    id : Text;
    user : Principal;
    status : VerificationStatus;
    timestamp : Time.Time;
    verificationApprovedTimestamp : ?Time.Time;
    expiryExtensionDays : Nat;
  };

  type NewsPost = {
    id : Text;
    title : Text;
    content : Text;
    author : Principal;
    timestamp : Time.Time;
    media : ?Storage.ExternalBlob;
    status : { #draft; #published };
  };

  type NewsPostInput = {
    title : Text;
    content : Text;
    media : ?Storage.ExternalBlob;
  };

  type CommunityMessage = {
    id : Text;
    user : Principal;
    content : Text;
    timestamp : Time.Time;
    role : Text;
    fullName : Text;
  };

  type CommunityMessageInput = {
    content : Text;
  };

  type PodcastType = { #audio; #video };
  type EpisodeType = {
    #trailer;
    #full;
    #bonus;
  };

  type PodcastCategory = {
    #arts;
    #business;
    #comedy;
    #education;
    #healthFitness;
    #kidsFamily;
    #music;
    #newsPolitics;
    #religionSpirituality;
    #science;
    #sports;
    #technology;
    #tvFilm;
    #other;
  };

  type Language = {
    #english;
    #hindi;
    #tamil;
    #telugu;
    #kannada;
    #malayalam;
    #punjabi;
    #bengali;
    #marathi;
    #gujarati;
    #other;
  };

  type PodcastModerationStatus = {
    #pending;
    #approved;
    #live;
    #rejected;
  };

  type PodcastShow = {
    id : Text;
    title : Text;
    description : Text;
    podcastType : PodcastType;
    category : PodcastCategory;
    language : Language;
    artwork : Storage.ExternalBlob;
    createdBy : Principal;
    timestamp : Time.Time;
    moderationStatus : PodcastModerationStatus;
    liveLink : ?Text;
  };

  type PodcastEpisode = {
    id : Text;
    showId : Text;
    title : Text;
    description : Text;
    seasonNumber : Nat;
    episodeNumber : Nat;
    episodeType : EpisodeType;
    isEighteenPlus : Bool;
    isExplicit : Bool;
    isPromotional : Bool;
    artwork : Storage.ExternalBlob;
    thumbnail : Storage.ExternalBlob;
    mediaFile : Storage.ExternalBlob;
    createdBy : Principal;
    timestamp : Time.Time;
    moderationStatus : PodcastModerationStatus;
  };

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

  type SupportRequestStatus = {
    #pending;
    #inProgress;
    #resolved;
    #rejected;
  };

  type SupportRequest = {
    id : Text;
    type_ : Text;
    details : Text;
    submitter : Principal;
    status : SupportRequestStatus;
    adminNotes : Text;
    timestamp : Time.Time;
    publicLink : ?Text;
    adminDecision : ?Bool;
  };

  // Old actor type.
  type OldActor = {
    blockedUsers : Map.Map<Principal, Bool>;
    blogPosts : Map.Map<Text, NewsPost>;
    communityMessages : Map.Map<Text, CommunityMessage>;
    podcasts : Map.Map<Text, PodcastShow>;
    podcastEpisodes : Map.Map<Text, PodcastEpisode>;
    artistProfiles : Map.Map<Text, ArtistProfile>;
    submissions : Map.Map<Text, SongSubmission>;
    supportRequests : Map.Map<Text, SupportRequest>;
    verificationRequests : Map.Map<Text, VerificationRequest>;
  };

  // New actor type.
  type NewActor = {
    blockedUsers : Map.Map<Principal, Bool>;
    blogPosts : Map.Map<Text, NewsPost>;
    communityMessages : Map.Map<Text, CommunityMessage>;
    podcasts : Map.Map<Text, PodcastShow>;
    podcastEpisodes : Map.Map<Text, PodcastEpisode>;
    artistProfiles : Map.Map<Text, ArtistProfile>;
    submissions : Map.Map<Text, SongSubmission>;
    supportRequests : Map.Map<Text, SupportRequest>;
    verificationRequests : Map.Map<Text, VerificationRequest>;
  };

  // Migration covers full state due to schema modifications.
  public func run(old : OldActor) : NewActor { old };
};
