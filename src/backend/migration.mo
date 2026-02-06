import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import InviteLinksModule "invite-links/invite-links-module";
import Stripe "stripe/stripe";
import UserApproval "user-approval/approval";

module {
  type SongStatus = { #pending; #approved; #rejected; #draft };

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
    acrResult : ?{ statusCode : Text; music : Text };
    preSaveLink : ?Text;
  };

  type OldActor = {
    submissions : Map.Map<Text, SongSubmission>;
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
    verificationRequests : Map.Map<Text, {
      id : Text;
      user : Principal;
      status : {
        #pending;
        #approved;
        #rejected;
        #waiting;
      };
      timestamp : Time.Time;
      verificationApprovedTimestamp : ?Time.Time;
      expiryExtensionDays : Nat;
    }>;
    teamMembers : Map.Map<Principal, Bool>;
    blogPosts : Map.Map<Text, {
      id : Text;
      title : Text;
      content : Text;
      author : Principal;
      timestamp : Time.Time;
      media : ?Storage.ExternalBlob;
      status : { #draft; #published };
    }>;
    communityMessages : Map.Map<Text, {
      id : Text;
      user : Principal;
      content : Text;
      timestamp : Time.Time;
      role : Text;
      fullName : Text;
    }>;
    accessControlState : AccessControl.AccessControlState;
    approvalState : UserApproval.UserApprovalState;
    inviteState : InviteLinksModule.InviteLinksSystemState;
    distributionFee : Int;
    annualMaintenanceFee : Int;
    stripeConfiguration : ?Stripe.StripeConfiguration;
    globalAnnouncement : Text;
    lastVerificationCheckTime : Time.Time;
    artistProfileEditingAccessEnabled : Bool;
  };

  type PodcastShow = {
    id : Text;
    title : Text;
    description : Text;
    podcastType : { #audio; #video };
    category : {
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
    language : {
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
    artwork : Storage.ExternalBlob;
    createdBy : Principal;
    timestamp : Time.Time;
  };

  type PodcastEpisode = {
    id : Text;
    showId : Text;
    title : Text;
    description : Text;
    seasonNumber : Nat;
    episodeNumber : Nat;
    episodeType : {
      #trailer;
      #full;
      #bonus;
    };
    isEighteenPlus : Bool;
    isExplicit : Bool;
    isPromotional : Bool;
    artwork : Storage.ExternalBlob;
    thumbnail : Storage.ExternalBlob;
    mediaFile : Storage.ExternalBlob;
    createdBy : Principal;
    timestamp : Time.Time;
  };

  type NewActor = {
    submissions : Map.Map<Text, SongSubmission>;
    podcasts : Map.Map<Text, PodcastShow>;
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
    verificationRequests : Map.Map<Text, {
      id : Text;
      user : Principal;
      status : {
        #pending;
        #approved;
        #rejected;
        #waiting;
      };
      timestamp : Time.Time;
      verificationApprovedTimestamp : ?Time.Time;
      expiryExtensionDays : Nat;
    }>;
    teamMembers : Map.Map<Principal, Bool>;
    blogPosts : Map.Map<Text, {
      id : Text;
      title : Text;
      content : Text;
      author : Principal;
      timestamp : Time.Time;
      media : ?Storage.ExternalBlob;
      status : { #draft; #published };
    }>;
    communityMessages : Map.Map<Text, {
      id : Text;
      user : Principal;
      content : Text;
      timestamp : Time.Time;
      role : Text;
      fullName : Text;
    }>;
    podcastEpisodes : Map.Map<Text, PodcastEpisode>;
    accessControlState : AccessControl.AccessControlState;
    approvalState : UserApproval.UserApprovalState;
    inviteState : InviteLinksModule.InviteLinksSystemState;
    distributionFee : Int;
    annualMaintenanceFee : Int;
    stripeConfiguration : ?Stripe.StripeConfiguration;
    globalAnnouncement : Text;
    lastVerificationCheckTime : Time.Time;
    artistProfileEditingAccessEnabled : Bool;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      podcasts = Map.empty<Text, PodcastShow>();
      podcastEpisodes = Map.empty<Text, PodcastEpisode>();
    };
  };
};
