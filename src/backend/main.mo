import Map "mo:core/Map";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Storage "blob-storage/Storage";
import List "mo:core/List";
import Random "mo:core/Random";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import InviteLinksModule "invite-links/invite-links-module";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import UserApproval "user-approval/approval";
import MixinAuthorization "authorization/MixinAuthorization";
import Iter "mo:core/Iter";

actor {
  include MixinStorage();

  public type SongStatus = {
    #pending;
    #approved;
    #rejected;
    #draft;
    #live;
  };

  public type AlbumTrack = {
    trackName : Text;
    albumName : Text;
    artistName : Text;
    audioFile : Storage.ExternalBlob;
    composer : Text;
    producer : Text;
    featuredArtist : Text;
    lyricist : Text;
  };

  public type TrackMetadata = {
    title : Text;
    artist : Text;
    featuredArtist : Text;
    composer : Text;
    producer : Text;
    lyricist : Text;
    audioFile : Storage.ExternalBlob;
    audioFilename : Text;
  };

  public type SongSubmission = {
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
    spotifyLink : ?Text;
    appleMusicLink : ?Text;
  };

  public type PublicSongInfo = {
    id : Text;
    title : Text;
    artist : Text;
    featuredArtist : Text;
    artwork : Storage.ExternalBlob;
    spotifyLink : ?Text;
    appleMusicLink : ?Text;
    releaseDate : Time.Time;
    genre : Text;
    language : Text;
    musicVideoLink : ?Text;
  };

  public type SongSubmissionInput = {
    title : Text;
    language : Text;
    releaseDate : Time.Time;
    releaseType : Text;
    genre : Text;
    artworkBlob : Storage.ExternalBlob;
    artworkFilename : Text;
    artist : Text;
    featuredArtist : Text;
    composer : Text;
    producer : Text;
    lyricist : Text;
    audioBlob : Storage.ExternalBlob;
    audioFilename : Text;
    additionalDetails : Text;
    discountCode : ?Text;
    albumTracks : ?[TrackMetadata];
    musicVideoLink : ?Text;
    spotifyLink : ?Text;
    appleMusicLink : ?Text;
  };

  public type ACRResult = {
    statusCode : Text;
    music : Text;
  };

  public type ACRCloudResponse = {
    statusCode : Text;
    music : Text;
  };

  public type PreSaveInput = {
    songId : Text;
    preSaveLink : Text;
  };

  public type PreSave = {
    link : Text;
    created : Time.Time;
  };

  public type SongSubmissionEditInput = {
    songSubmissionId : Text;
    title : Text;
    releaseType : Text;
    genre : Text;
    language : Text;
    releaseDate : Time.Time;
    artworkBlob : Storage.ExternalBlob;
    artworkFilename : Text;
    artist : Text;
    featuredArtist : Text;
    composer : Text;
    producer : Text;
    lyricist : Text;
    audioFile : Storage.ExternalBlob;
    audioFilename : Text;
    additionalDetails : Text;
    discountCode : ?Text;
    musicVideoLink : ?Text;
    albumTracks : ?[TrackMetadata];
    spotifyLink : ?Text;
    appleMusicLink : ?Text;
  };

  public type UpdateSongSubmissionEditStatus = {
    songSubmissionId : Text;
    status : SongStatus;
  };

  public type RetrieveSongSubmissionEditData = {
    songSubmissionId : Text;
  };

  public type RetrieveSongSubmissionEditDataResponse = {
    songSubmissionId : Text;
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
    discountCode : ?Text;
    musicVideoLink : ?Text;
    albumTracks : ?[TrackMetadata];
  };

  public type ArtistSubmissionLinksOutput = {
    artist : Text;
    spotifyProfile : Text;
    appleProfile : Text;
    youtubeChannelLink : Text;
    musicVideoLink : Text;
  };

  public type PlatformLinks = {
    spotifyProfile : Text;
    appleProfile : Text;
    youtubeChannel : Text;
  };

  public type ArtistProfile = {
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

  public type SaveArtistProfileInput = {
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

  public type UserCategory = {
    #generalArtist;
    #proArtist;
    #ultraArtist;
    #generalLabel;
    #proLabel;
  };

  public type UserProfile = {
    name : Text;
    artistId : Text;
    category : UserCategory;
  };

  public type VerificationStatus = {
    #pending;
    #approved;
    #rejected;
    #waiting;
  };

  public type MonthlyListenerStats = {
    year : Nat;
    month : Nat;
    value : Nat;
  };

  public type ListenerStatsUpdate = {
    year : Nat;
    month : Nat;
    value : Nat;
  };

  public type VerificationRequest = {
    id : Text;
    user : Principal;
    status : VerificationStatus;
    timestamp : Time.Time;
    verificationApprovedTimestamp : ?Time.Time;
    expiryExtensionDays : Nat;
  };

  public type VerificationRequestWithFullName = {
    id : Text;
    user : Principal;
    status : VerificationStatus;
    timestamp : Time.Time;
    fullName : Text;
    verificationApprovedTimestamp : ?Time.Time;
    expiryExtensionDays : Nat;
  };

  public type AppUserRole = {
    #admin;
    #team;
    #user;
  };

  public type BlogPost = {
    id : Text;
    title : Text;
    content : Text;
    author : Principal;
    timestamp : Time.Time;
    media : ?Storage.ExternalBlob;
    status : { #draft; #published };
  };

  public type BlogPostInput = {
    title : Text;
    content : Text;
    media : ?Storage.ExternalBlob;
  };

  public type CommunityMessage = {
    id : Text;
    user : Principal;
    content : Text;
    timestamp : Time.Time;
    role : Text;
    fullName : Text;
  };

  public type CommunityMessageInput = {
    content : Text;
  };

  public type PodcastType = { #audio; #video };
  public type EpisodeType = {
    #trailer;
    #full;
    #bonus;
  };

  public type PodcastCategory = {
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

  public type Language = {
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

  public type PodcastModerationStatus = {
    #pending;
    #approved;
    #live;
    #rejected;
  };

  public type PodcastShow = {
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

  public type PodcastEpisode = {
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

  public type PodcastShowInput = {
    title : Text;
    description : Text;
    podcastType : PodcastType;
    category : PodcastCategory;
    language : Language;
    artwork : Storage.ExternalBlob;
  };

  public type PodcastEpisodeInput = {
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
  };

  public type YouTubeCopyrightClaim = {
    id : Text;
    songId : Text;
    youtubeChannelLink : Text;
    submitter : Principal;
    timestamp : Time.Time;
  };

  public type YouTubeCopyrightClaimInput = {
    songId : Text;
    youtubeChannelLink : Text;
  };

  public type InstagramProfileConnection = {
    id : Text;
    songId : Text;
    instagramProfileLink : Text;
    submitter : Principal;
    timestamp : Time.Time;
  };

  public type InstagramProfileConnectionInput = {
    songId : Text;
    instagramProfileLink : Text;
  };

  public type SupportRequestStatus = {
    #pending;
    #inProgress;
    #resolved;
    #rejected;
  };

  public type SupportRequest = {
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

  public type SubmitSupportRequestInput = {
    type_ : Text;
    details : Text;
  };

  public type UpdateSupportRequestInput = {
    id : Text;
    status : SupportRequestStatus;
    adminNotes : Text;
  };

  public type BlockedUser = {
    songSubmissionBlocked : Bool;
    podcastSubmissionBlocked : Bool;
  };

  public type SubscriptionPlan = {
    planName : Text;
    pricePerYear : Nat;
    redirectUrl : Text;
    benefits : [Text];
  };

  public type VideoSubmissionStatus = {
    #pending;
    #approved;
    #rejected;
    #waiting;
    #live;
  };

  public type VideoSubmission = {
    id : Text;
    userId : Principal;
    title : Text;
    description : Text;
    category : Text;
    tags : [Text];
    thumbnail : Storage.ExternalBlob;
    artwork : Storage.ExternalBlob;
    videoFile : Storage.ExternalBlob;
    status : VideoSubmissionStatus;
    liveUrl : ?Text;
    submittedAt : Time.Time;
    updatedAt : Time.Time;
  };

  public type VideoSubmissionInput = {
    title : Text;
    description : Text;
    category : Text;
    tags : [Text];
    thumbnail : Storage.ExternalBlob;
    artwork : Storage.ExternalBlob;
    videoFile : Storage.ExternalBlob;
  };

  public type FeaturedArtistSong = {
    title : Text;
    link : Text;
  };

  public type FeaturedArtistInput = {
    artistName : Text;
    photoUrl : Text;
    aboutBlurb : Text;
    songs : [FeaturedArtistSong];
    isActive : Bool;
  };

  public type FeaturedArtist = {
    id : Nat;
    slotIndex : Nat;
    artistName : Text;
    photoUrl : Text;
    aboutBlurb : Text;
    songs : [FeaturedArtistSong];
    isActive : Bool;
  };

  public type TopVibingSong = {
    id : Nat;
    title : Text;
    artistName : Text;
    genre : Text;
    artworkUrl : Text;
    streamingLink : Text;
    tagline : ?Text;
    rank : Nat;
  };

  public type LabelPartnerInput = {
    logoUrl : Text;
    labelName : Text;
    websiteLink : ?Text;
    description : Text;
  };

  public type LabelPartner = {
    id : Nat;
    logoUrl : Text;
    labelName : Text;
    websiteLink : ?Text;
    description : Text;
  };

  public type LabelReleaseInput = {
    labelId : Nat;
    artworkUrl : Text;
    songTitle : Text;
    artistName : Text;
    streamingLink : Text;
  };

  public type LabelRelease = {
    id : Nat;
    labelId : Nat;
    artworkUrl : Text;
    songTitle : Text;
    artistName : Text;
    streamingLink : Text;
  };

  let submissions = Map.empty<Text, SongSubmission>();
  let podcasts = Map.empty<Text, PodcastShow>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let artistProfiles = Map.empty<Text, ArtistProfile>();
  let verificationRequests = Map.empty<Text, VerificationRequest>();
  let teamMembers = Map.empty<Principal, Bool>();
  let blockedUsers = Map.empty<Principal, BlockedUser>();
  let blogPosts = Map.empty<Text, BlogPost>();
  let communityMessages = Map.empty<Text, CommunityMessage>();
  let podcastEpisodes = Map.empty<Text, PodcastEpisode>();
  let youtubeCopyrightClaims = Map.empty<Text, YouTubeCopyrightClaim>();
  let instagramProfileConnections = Map.empty<Text, InstagramProfileConnection>();
  let supportRequests = Map.empty<Text, SupportRequest>();
  let videoSubmissions = Map.empty<Text, VideoSubmission>();
  let monthlyListenerStats = Map.empty<Text, [MonthlyListenerStats]>();

  let labelPartners = Map.empty<Nat, LabelPartner>();
  let labelReleases = Map.empty<Nat, LabelRelease>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let approvalState = UserApproval.initState(accessControlState);
  let inviteState = InviteLinksModule.initState();

  let featuredArtists = Map.empty<Nat, FeaturedArtist>();
  let topVibingSongs = Map.empty<Nat, TopVibingSong>();
  var topVibingSongsSize = 0;

  var distributionFee : Int = 500;
  var annualMaintenanceFee : Int = 1000;
  var stripeConfiguration : ?Stripe.StripeConfiguration = null;
  var globalAnnouncement : Text = "";
  var lastVerificationCheckTime : Time.Time = 0;
  var artistProfileEditingAccessEnabled : Bool = true;
  var websiteLogo : ?Storage.ExternalBlob = null;

  var labelPartnersSize = 0;
  var labelReleasesSize = 0;
  let subscriptionPlans = Map.empty<Text, SubscriptionPlan>();

  func isTeamMember(user : Principal) : Bool {
    switch (teamMembers.get(user)) {
      case (null) { false };
      case (?isTeam) { isTeam };
    };
  };

  func isBlockedForSongs(user : Principal) : Bool {
    switch (blockedUsers.get(user)) {
      case (null) { false };
      case (?blockedUser) { blockedUser.songSubmissionBlocked };
    };
  };

  func isBlockedForPodcasts(user : Principal) : Bool {
    switch (blockedUsers.get(user)) {
      case (null) { false };
      case (?blockedUser) { blockedUser.podcastSubmissionBlocked };
    };
  };

  func isAdminOrTeam(caller : Principal) : Bool {
    AccessControl.isAdmin(accessControlState, caller) or isTeamMember(caller);
  };

  func requireAdmin(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  func requireAdminOrTeam(caller : Principal) {
    if (not isAdminOrTeam(caller)) {
      Runtime.trap("Unauthorized: Admin or team privileges required");
    };
  };

  func requireUser(caller : Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can perform this action");
    };
  };

  func requireUserNotBlockedForSongs(caller : Principal) {
    if (isBlockedForSongs(caller)) {
      Runtime.trap("Your access blocked due to submission limit is full");
    };
  };

  func requireUserNotBlockedForPodcasts(caller : Principal) {
    if (isBlockedForPodcasts(caller)) {
      Runtime.trap("Your access blocked due to submission limit is full");
    };
  };

  func getUserRoleText(user : Principal) : Text {
    if (AccessControl.isAdmin(accessControlState, user)) {
      "Admin";
    } else if (isTeamMember(user)) {
      "Team Member";
    } else {
      "Artist";
    };
  };

  func getUserFullName(user : Principal) : Text {
    let userProfiles = artistProfiles.values().toArray().filter(
      func(profile) { profile.owner == user }
    );
    if (userProfiles.size() > 0) { userProfiles[0].fullName } else {
      "Anonymous User";
    };
  };

  func isValidUrl(url : Text) : Bool {
    url.startsWith(#text "http://") or url.startsWith(#text "https://");
  };

  func canEditSubmission(submission : SongSubmission) : Bool {
    switch (submission.status) {
      case (#draft) { true };
      case (#rejected) { true };
      case (#pending) { true };
      case (#approved) { false };
      case (#live) { false };
    };
  };

  public shared ({ caller }) func addLabelPartner(input : LabelPartnerInput) : async Nat {
    requireAdmin(caller);
    let partnerId = labelPartnersSize + 1;
    let partner : LabelPartner = {
      id = partnerId;
      logoUrl = input.logoUrl;
      labelName = input.labelName;
      websiteLink = input.websiteLink;
      description = input.description;
    };
    labelPartners.add(partnerId, partner);
    labelPartnersSize += 1;
    partnerId;
  };

  public shared ({ caller }) func updateLabelPartner(partner : LabelPartner) : async () {
    requireAdmin(caller);
    if (not labelPartners.containsKey(partner.id)) {
      Runtime.trap("LabelPartner not found");
    };
    labelPartners.add(partner.id, partner);
  };

  public shared ({ caller }) func deleteLabelPartner(id : Nat) : async () {
    requireAdmin(caller);
    if (not labelPartners.containsKey(id)) {
      Runtime.trap("LabelPartner not found");
    };
    labelPartners.remove(id);

    let releasesToDelete = labelReleases.values().toArray().filter(
      func(release) { release.labelId == id }
    );
    for (release in releasesToDelete.values()) {
      labelReleases.remove(release.id);
      labelReleasesSize -= 1;
    };
    labelPartnersSize -= 1;
  };

  public query func getAllLabelPartners() : async [LabelPartner] {
    labelPartners.values().toArray();
  };

  public shared ({ caller }) func addLabelRelease(input : LabelReleaseInput) : async Nat {
    requireAdmin(caller);

    switch (labelPartners.get(input.labelId)) {
      case (null) { Runtime.trap("LabelPartner not found") };
      case (?_) {
        let releaseId = labelReleasesSize + 1;
        let release : LabelRelease = {
          id = releaseId;
          labelId = input.labelId;
          artworkUrl = input.artworkUrl;
          songTitle = input.songTitle;
          artistName = input.artistName;
          streamingLink = input.streamingLink;
        };
        labelReleases.add(releaseId, release);
        labelReleasesSize += 1;
        releaseId;
      };
    };
  };

  public shared ({ caller }) func updateLabelRelease(release : LabelRelease) : async () {
    requireAdmin(caller);
    if (not labelReleases.containsKey(release.id)) {
      Runtime.trap("LabelRelease not found");
    };
    labelReleases.add(release.id, release);
  };

  public shared ({ caller }) func deleteLabelRelease(id : Nat) : async () {
    requireAdmin(caller);
    if (not labelReleases.containsKey(id)) {
      Runtime.trap("LabelRelease not found");
    };
    labelReleases.remove(id);
    labelReleasesSize -= 1;
  };

  public query func getLabelReleases(labelId : Nat) : async [LabelRelease] {
    labelReleases.values().toArray().filter(
      func(release) { release.labelId == labelId }
    );
  };

  public query ({ caller }) func getAllLabelReleases() : async [LabelRelease] {
    requireAdmin(caller);
    labelReleases.values().toArray();
  };

  // Authentication and Stripe integration
  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    requireAdmin(caller);
    stripeConfiguration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Invite links and RSVP system
  public shared ({ caller }) func generateInviteCode() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can generate invite codes");
    };
    let blob = await Random.blob();
    let code = InviteLinksModule.generateUUID(blob);
    InviteLinksModule.generateInviteCode(inviteState, code);
    code;
  };

  public func submitRSVP(name : Text, attending : Bool, inviteCode : Text) : async () {
    InviteLinksModule.submitRSVP(inviteState, name, attending, inviteCode);
  };

  public query ({ caller }) func getAllRSVPs() : async [InviteLinksModule.RSVP] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view RSVPs");
    };
    InviteLinksModule.getAllRSVPs(inviteState);
  };

  public query ({ caller }) func getInviteCodes() : async [InviteLinksModule.InviteCode] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view invite codes");
    };
    InviteLinksModule.getInviteCodes(inviteState);
  };

  // Approval-based user system
  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    requireAdmin(caller);
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };


  // ── Artist Profile Management ──────────────────────────────────────────────

  public shared ({ caller }) func createArtistProfile(input : SaveArtistProfileInput) : async Text {
    requireUser(caller);
    let blob = await Random.blob();
    let id = InviteLinksModule.generateUUID(blob);
    let profile : ArtistProfile = {
      id;
      owner = caller;
      fullName = input.fullName;
      stageName = input.stageName;
      email = input.email;
      mobileNumber = input.mobileNumber;
      instagramLink = input.instagramLink;
      facebookLink = input.facebookLink;
      spotifyProfile = input.spotifyProfile;
      appleProfile = input.appleProfile;
      youtubeChannelLink = input.youtubeChannelLink;
      profilePhoto = input.profilePhoto;
      profilePhotoFilename = input.profilePhotoFilename;
      isApproved = false;
      isVerified = false;
    };
    artistProfiles.add(id, profile);
    id;
  };

  public shared ({ caller }) func updateArtistProfile(id : Text, input : SaveArtistProfileInput) : async () {
    requireUser(caller);
    switch (artistProfiles.get(id)) {
      case (null) { Runtime.trap("Artist profile not found") };
      case (?existing) {
        if (existing.owner != caller) {
          Runtime.trap("Unauthorized: You can only edit your own profiles");
        };
        if (existing.isApproved and not artistProfileEditingAccessEnabled) {
          Runtime.trap("Profile editing is currently disabled");
        };
        let updated : ArtistProfile = {
          id;
          owner = existing.owner;
          fullName = input.fullName;
          stageName = input.stageName;
          email = input.email;
          mobileNumber = input.mobileNumber;
          instagramLink = input.instagramLink;
          facebookLink = input.facebookLink;
          spotifyProfile = input.spotifyProfile;
          appleProfile = input.appleProfile;
          youtubeChannelLink = input.youtubeChannelLink;
          profilePhoto = input.profilePhoto;
          profilePhotoFilename = input.profilePhotoFilename;
          isApproved = existing.isApproved;
          isVerified = existing.isVerified;
        };
        artistProfiles.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteArtistProfile(id : Text) : async () {
    requireUser(caller);
    switch (artistProfiles.get(id)) {
      case (null) { Runtime.trap("Artist profile not found") };
      case (?existing) {
        if (existing.owner != caller) {
          Runtime.trap("Unauthorized: You can only delete your own profiles");
        };
        artistProfiles.remove(id);
      };
    };
  };

  public query ({ caller }) func getMyArtistProfiles() : async [ArtistProfile] {
    requireUser(caller);
    artistProfiles.values().toArray().filter(
      func(p : ArtistProfile) : Bool { p.owner == caller }
    );
  };

  public query ({ caller }) func getAllArtistProfilesForAdmin() : async [ArtistProfile] {
    requireAdminOrTeam(caller);
    artistProfiles.values().toArray();
  };

  public query ({ caller }) func getAllArtistProfileOwnersForAdmin() : async [Principal] {
    requireAdminOrTeam(caller);
    artistProfiles.values().toArray().map(func(p : ArtistProfile) : Principal { p.owner });
  };

  public query ({ caller }) func getArtistProfilesByUserForAdmin(user : Principal) : async [ArtistProfile] {
    requireAdminOrTeam(caller);
    artistProfiles.values().toArray().filter(
      func(p : ArtistProfile) : Bool { p.owner == user }
    );
  };

  public query func getArtistProfileByOwner(owner : Principal) : async ?ArtistProfile {
    let matches = artistProfiles.values().toArray().filter(
      func(p : ArtistProfile) : Bool { p.owner == owner }
    );
    if (matches.size() > 0) { ?matches[0] } else { null };
  };

  public query func getArtistProfileIdByOwnerId(owner : Principal) : async ?Text {
    let matches = artistProfiles.values().toArray().filter(
      func(p : ArtistProfile) : Bool { p.owner == owner }
    );
    if (matches.size() > 0) { ?matches[0].id } else { null };
  };

  public query func doesUserHaveArtistProfile(owner : Principal) : async Bool {
    artistProfiles.values().toArray().filter(
      func(p : ArtistProfile) : Bool { p.owner == owner }
    ).size() > 0;
  };

  public query func getArtistProfileEditingAccessStatus() : async Bool {
    artistProfileEditingAccessEnabled;
  };

  public query func isArtistProfileEditingEnabled() : async Bool {
    artistProfileEditingAccessEnabled;
  };

  public shared ({ caller }) func setArtistProfileEditingAccess(enabled : Bool) : async () {
    requireAdmin(caller);
    artistProfileEditingAccessEnabled := enabled;
  };

  public shared ({ caller }) func adminEditArtistProfile(id : Text, input : SaveArtistProfileInput) : async () {
    requireAdminOrTeam(caller);
    switch (artistProfiles.get(id)) {
      case (null) { Runtime.trap("Artist profile not found") };
      case (?existing) {
        let updated : ArtistProfile = {
          id;
          owner = existing.owner;
          fullName = input.fullName;
          stageName = input.stageName;
          email = input.email;
          mobileNumber = input.mobileNumber;
          instagramLink = input.instagramLink;
          facebookLink = input.facebookLink;
          spotifyProfile = input.spotifyProfile;
          appleProfile = input.appleProfile;
          youtubeChannelLink = input.youtubeChannelLink;
          profilePhoto = input.profilePhoto;
          profilePhotoFilename = input.profilePhotoFilename;
          isApproved = input.isApproved;
          isVerified = existing.isVerified;
        };
        artistProfiles.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func adminDeleteArtistProfile(id : Text) : async () {
    requireAdminOrTeam(caller);
    if (not artistProfiles.containsKey(id)) {
      Runtime.trap("Artist profile not found");
    };
    artistProfiles.remove(id);
  };

  // ── Song Submission ────────────────────────────────────────────────────────

  public shared ({ caller }) func submitSong(input : SongSubmissionInput) : async Text {
    requireUser(caller);
    requireUserNotBlockedForSongs(caller);
    let blob = await Random.blob();
    let id = InviteLinksModule.generateUUID(blob);
    let submission : SongSubmission = {
      id;
      title = input.title;
      releaseType = input.releaseType;
      genre = input.genre;
      language = input.language;
      releaseDate = input.releaseDate;
      artwork = input.artworkBlob;
      artworkFilename = input.artworkFilename;
      artist = input.artist;
      featuredArtist = input.featuredArtist;
      composer = input.composer;
      producer = input.producer;
      lyricist = input.lyricist;
      audioFile = input.audioBlob;
      audioFilename = input.audioFilename;
      additionalDetails = input.additionalDetails;
      status = #pending;
      adminRemarks = "";
      adminComment = "";
      submitter = caller;
      timestamp = Time.now();
      discountCode = input.discountCode;
      acrResult = null;
      preSaveLink = null;
      liveStreamLink = null;
      musicVideoLink = input.musicVideoLink;
      albumTracks = input.albumTracks;
      publicLink = null;
      adminLiveLink = null;
      isManuallyRejected = false;
      spotifyLink = input.spotifyLink;
      appleMusicLink = input.appleMusicLink;
    };
    submissions.add(id, submission);
    id;
  };

  // User edits their own submission (only when in editable state)
  public shared ({ caller }) func editSongSubmission(input : SongSubmissionEditInput) : async () {
    requireUser(caller);
    switch (submissions.get(input.songSubmissionId)) {
      case (null) { Runtime.trap("Submission not found") };
      case (?existing) {
        if (existing.submitter != caller) {
          Runtime.trap("Unauthorized: You can only edit your own submissions");
        };
        if (not canEditSubmission(existing)) {
          Runtime.trap("This submission cannot be edited in its current state");
        };
        let updated : SongSubmission = {
          id = existing.id;
          title = input.title;
          releaseType = input.releaseType;
          genre = input.genre;
          language = input.language;
          releaseDate = input.releaseDate;
          artwork = input.artworkBlob;
          artworkFilename = input.artworkFilename;
          artist = input.artist;
          featuredArtist = input.featuredArtist;
          composer = input.composer;
          producer = input.producer;
          lyricist = input.lyricist;
          audioFile = input.audioFile;
          audioFilename = input.audioFilename;
          additionalDetails = input.additionalDetails;
          status = existing.status;
          adminRemarks = existing.adminRemarks;
          adminComment = existing.adminComment;
          submitter = existing.submitter;
          timestamp = existing.timestamp;
          discountCode = input.discountCode;
          acrResult = existing.acrResult;
          preSaveLink = existing.preSaveLink;
          liveStreamLink = existing.liveStreamLink;
          musicVideoLink = input.musicVideoLink;
          albumTracks = input.albumTracks;
          publicLink = existing.publicLink;
          adminLiveLink = existing.adminLiveLink;
          isManuallyRejected = existing.isManuallyRejected;
          spotifyLink = input.spotifyLink;
          appleMusicLink = input.appleMusicLink;
        };
        submissions.add(input.songSubmissionId, updated);
      };
    };
  };

  // Admin updates submission status and notes
  public shared ({ caller }) func adminUpdateSubmission(
    id : Text,
    newStatus : SongStatus,
    adminRemarks : Text,
    adminComment : Text
  ) : async () {
    requireAdminOrTeam(caller);
    switch (submissions.get(id)) {
      case (null) { Runtime.trap("Submission not found") };
      case (?existing) {
        let isRejected = switch (newStatus) { case (#rejected) { true }; case (_) { false } };
        let updated : SongSubmission = {
          id = existing.id;
          title = existing.title;
          releaseType = existing.releaseType;
          genre = existing.genre;
          language = existing.language;
          releaseDate = existing.releaseDate;
          artwork = existing.artwork;
          artworkFilename = existing.artworkFilename;
          artist = existing.artist;
          featuredArtist = existing.featuredArtist;
          composer = existing.composer;
          producer = existing.producer;
          lyricist = existing.lyricist;
          audioFile = existing.audioFile;
          audioFilename = existing.audioFilename;
          additionalDetails = existing.additionalDetails;
          status = newStatus;
          adminRemarks;
          adminComment;
          submitter = existing.submitter;
          timestamp = existing.timestamp;
          discountCode = existing.discountCode;
          acrResult = existing.acrResult;
          preSaveLink = existing.preSaveLink;
          liveStreamLink = existing.liveStreamLink;
          musicVideoLink = existing.musicVideoLink;
          albumTracks = existing.albumTracks;
          publicLink = existing.publicLink;
          adminLiveLink = existing.adminLiveLink;
          isManuallyRejected = isRejected;
          spotifyLink = existing.spotifyLink;
          appleMusicLink = existing.appleMusicLink;
        };
        submissions.add(id, updated);
      };
    };
  };

  // Admin marks submission as live and sets the live link
  public shared ({ caller }) func adminSetSubmissionLive(
    id : Text,
    liveUrl : Text,
    adminRemarks : Text,
    adminComment : Text
  ) : async () {
    requireAdminOrTeam(caller);
    switch (submissions.get(id)) {
      case (null) { Runtime.trap("Submission not found") };
      case (?existing) {
        let updated : SongSubmission = {
          id = existing.id;
          title = existing.title;
          releaseType = existing.releaseType;
          genre = existing.genre;
          language = existing.language;
          releaseDate = existing.releaseDate;
          artwork = existing.artwork;
          artworkFilename = existing.artworkFilename;
          artist = existing.artist;
          featuredArtist = existing.featuredArtist;
          composer = existing.composer;
          producer = existing.producer;
          lyricist = existing.lyricist;
          audioFile = existing.audioFile;
          audioFilename = existing.audioFilename;
          additionalDetails = existing.additionalDetails;
          status = #live;
          adminRemarks;
          adminComment;
          submitter = existing.submitter;
          timestamp = existing.timestamp;
          discountCode = existing.discountCode;
          acrResult = existing.acrResult;
          preSaveLink = existing.preSaveLink;
          liveStreamLink = existing.liveStreamLink;
          musicVideoLink = existing.musicVideoLink;
          albumTracks = existing.albumTracks;
          publicLink = existing.publicLink;
          adminLiveLink = ?liveUrl;
          isManuallyRejected = false;
          spotifyLink = existing.spotifyLink;
          appleMusicLink = existing.appleMusicLink;
        };
        submissions.add(id, updated);
      };
    };
  };

  // Admin edits submission details (including artwork/audio)
  public shared ({ caller }) func adminEditSubmission(input : SongSubmissionEditInput) : async () {
    requireAdminOrTeam(caller);
    switch (submissions.get(input.songSubmissionId)) {
      case (null) { Runtime.trap("Submission not found") };
      case (?existing) {
        let updated : SongSubmission = {
          id = existing.id;
          title = input.title;
          releaseType = input.releaseType;
          genre = input.genre;
          language = input.language;
          releaseDate = input.releaseDate;
          artwork = input.artworkBlob;
          artworkFilename = input.artworkFilename;
          artist = input.artist;
          featuredArtist = input.featuredArtist;
          composer = input.composer;
          producer = input.producer;
          lyricist = input.lyricist;
          audioFile = input.audioFile;
          audioFilename = input.audioFilename;
          additionalDetails = input.additionalDetails;
          status = existing.status;
          adminRemarks = existing.adminRemarks;
          adminComment = existing.adminComment;
          submitter = existing.submitter;
          timestamp = existing.timestamp;
          discountCode = input.discountCode;
          acrResult = existing.acrResult;
          preSaveLink = existing.preSaveLink;
          liveStreamLink = existing.liveStreamLink;
          musicVideoLink = input.musicVideoLink;
          albumTracks = input.albumTracks;
          publicLink = existing.publicLink;
          adminLiveLink = existing.adminLiveLink;
          isManuallyRejected = existing.isManuallyRejected;
          spotifyLink = input.spotifyLink;
          appleMusicLink = input.appleMusicLink;
        };
        submissions.add(input.songSubmissionId, updated);
      };
    };
  };

  // Admin deletes a submission
  public shared ({ caller }) func adminDeleteSubmission(id : Text) : async () {
    requireAdminOrTeam(caller);
    if (not submissions.containsKey(id)) {
      Runtime.trap("Submission not found");
    };
    submissions.remove(id);
  };

  public query ({ caller }) func getMySubmissions() : async [SongSubmission] {
    submissions.values().toArray().filter(
      func(s : SongSubmission) : Bool { s.submitter == caller }
    );
  };

  public query ({ caller }) func getAllSubmissionsForAdmin() : async [SongSubmission] {
    requireAdminOrTeam(caller);
    submissions.values().toArray();
  };

  // Check if a user is blocked for song submissions
  public query func isUserBlockedSongSubmission(user : Principal) : async Bool {
    isBlockedForSongs(user);
  };

  // Check if a user is blocked for podcast submissions
  public query func isUserBlockedPodcastSubmission(user : Principal) : async Bool {
    isBlockedForPodcasts(user);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };
};
