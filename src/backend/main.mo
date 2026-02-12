import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";
import Random "mo:core/Random";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import InviteLinksModule "invite-links/invite-links-module";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import UserApproval "user-approval/approval";


// Use migration function via "with" clause

actor {
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
    albumTracks : ?[TrackMetadata];
    publicLink : ?Text;
  };

  public type SubmitSongInput = {
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
    liveStreamLink : ?Text;
    albumTracks : ?[TrackMetadata];
    publicLink : ?Text;
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
    profilePhoto : Storage.ExternalBlob;
    isApproved : Bool;
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
    profilePhoto : Storage.ExternalBlob;
    isApproved : Bool;
  };

  public type UserProfile = {
    name : Text;
    artistId : Text;
  };

  public type VerificationStatus = {
    #pending;
    #approved;
    #rejected;
    #waiting;
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

  include MixinStorage();

  let submissions = Map.empty<Text, SongSubmission>();
  let podcasts = Map.empty<Text, PodcastShow>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let artistProfiles = Map.empty<Text, ArtistProfile>();
  let verificationRequests = Map.empty<Text, VerificationRequest>();
  let teamMembers = Map.empty<Principal, Bool>();
  let blogPosts = Map.empty<Text, BlogPost>();
  let communityMessages = Map.empty<Text, CommunityMessage>();
  let podcastEpisodes = Map.empty<Text, PodcastEpisode>();
  let youtubeCopyrightClaims = Map.empty<Text, YouTubeCopyrightClaim>();
  let instagramProfileConnections = Map.empty<Text, InstagramProfileConnection>();
  let supportRequests = Map.empty<Text, SupportRequest>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let approvalState = UserApproval.initState(accessControlState);
  let inviteState = InviteLinksModule.initState();

  var distributionFee : Int = 500;
  var annualMaintenanceFee : Int = 1000;
  var stripeConfiguration : ?Stripe.StripeConfiguration = null;
  var globalAnnouncement : Text = "";
  var lastVerificationCheckTime : Time.Time = 0;
  var artistProfileEditingAccessEnabled : Bool = true;

  func isTeamMember(user : Principal) : Bool {
    switch (teamMembers.get(user)) {
      case (null) { false };
      case (?isTeam) { isTeam };
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

  // Song Submission APIs

  // Save a new song submission
  public shared ({ caller }) func submitSong(input : SubmitSongInput) : async Text {
    requireUser(caller);

    let blob = await Random.blob();
    let submissionId = InviteLinksModule.generateUUID(blob);

    let submission : SongSubmission = {
      id = submissionId;
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
      liveStreamLink = input.liveStreamLink;
      albumTracks = input.albumTracks;
      publicLink = input.publicLink;
    };

    submissions.add(submissionId, submission);
    submissionId;
  };

  // Get all submissions for the current user
  public query ({ caller }) func getMySubmissions() : async [SongSubmission] {
    requireUser(caller);

    submissions.values().toArray().filter(
      func(submission) { submission.submitter == caller }
    );
  };

  // Admin/Team can retrieve all submissions
  public query ({ caller }) func getAllSubmissionsForAdmin() : async [SongSubmission] {
    requireAdminOrTeam(caller);
    submissions.values().toArray();
  };

  // Admin/Team can update the status and comments of a submission
  public shared ({ caller }) func adminUpdateSubmission(id : Text, status : SongStatus, adminRemarks : Text, adminComment : Text) : async () {
    requireAdminOrTeam(caller);

    switch (submissions.get(id)) {
      case (null) {
        Runtime.trap("Submission not found");
      };
      case (?submission) {
        let updatedSubmission = {
          submission with
          status;
          adminRemarks;
          adminComment;
        };
        submissions.add(id, updatedSubmission);
      };
    };
  };

  // Admin/Team can delete a submission
  public shared ({ caller }) func adminDeleteSubmission(id : Text) : async () {
    requireAdminOrTeam(caller);

    if (not submissions.containsKey(id)) {
      Runtime.trap("Submission not found");
    };
    submissions.remove(id);
  };

  // ================================
  // ARTIST PROFILE MANAGEMENT
  // ================================

  // New backend APIs to support multiple artist profiles per user

  // Backend API to create a new artist profile
  public shared ({ caller }) func createArtistProfile(input : SaveArtistProfileInput) : async Text {
    requireUser(caller);

    if (input.instagramLink == "" or not isValidUrl(input.instagramLink)) {
      Runtime.trap("Instagram link is required and must be a valid URL");
    };
    if (input.facebookLink == "" or not isValidUrl(input.facebookLink)) {
      Runtime.trap("Facebook link is required and must be a valid URL");
    };

    let blob = await Random.blob();
    let newId = InviteLinksModule.generateUUID(blob);

    let profile : ArtistProfile = {
      id = newId;
      owner = caller;
      fullName = input.fullName;
      stageName = input.stageName;
      email = input.email;
      mobileNumber = input.mobileNumber;
      instagramLink = input.instagramLink;
      facebookLink = input.facebookLink;
      spotifyProfile = input.spotifyProfile;
      appleProfile = input.appleProfile;
      profilePhoto = input.profilePhoto;
      isApproved = false;
    };

    artistProfiles.add(newId, profile);
    newId;
  };

  // Backend API to list all artist profiles for the current authenticated user
  public query ({ caller }) func getMyArtistProfiles() : async [ArtistProfile] {
    requireUser(caller);
    artistProfiles.values().toArray().filter(
      func(profile) { profile.owner == caller }
    );
  };

  // Backend API to update an existing artist profile by ID
  public shared ({ caller }) func updateArtistProfile(id : Text, input : SaveArtistProfileInput) : async () {
    requireUser(caller);

    switch (artistProfiles.get(id)) {
      case (null) {
        Runtime.trap("Artist profile not found");
      };
      case (?profile) {
        if (profile.owner != caller) {
          Runtime.trap("Unauthorized: Can only edit your own artist profiles");
        };

        if (input.instagramLink == "" or not isValidUrl(input.instagramLink)) {
          Runtime.trap("Instagram link is required and must be a valid URL");
        };
        if (input.facebookLink == "" or not isValidUrl(input.facebookLink)) {
          Runtime.trap("Facebook link is required and must be a valid URL");
        };
        let updatedProfile = {
          profile with
          fullName = input.fullName;
          stageName = input.stageName;
          email = input.email;
          mobileNumber = input.mobileNumber;
          instagramLink = input.instagramLink;
          facebookLink = input.facebookLink;
          spotifyProfile = input.spotifyProfile;
          appleProfile = input.appleProfile;
          profilePhoto = input.profilePhoto;
        };
        artistProfiles.add(id, updatedProfile);
      };
    };
  };

  // Backend API to delete an artist profile by ID
  public shared ({ caller }) func deleteArtistProfile(id : Text) : async () {
    requireUser(caller);

    switch (artistProfiles.get(id)) {
      case (null) {
        Runtime.trap("Artist profile not found");
      };
      case (?profile) {
        if (profile.owner != caller) {
          Runtime.trap("Unauthorized: Can only delete your own artist profiles");
        };
        artistProfiles.remove(id);
      };
    };
  };

  // New admin-facing backend APIs

  // Admin/Team can retrieve all artist profiles
  public query ({ caller }) func getAllArtistProfilesForAdmin() : async [ArtistProfile] {
    requireAdminOrTeam(caller);
    artistProfiles.values().toArray();
  };

  // Admin/Team can edit any artist profile by ID
  public shared ({ caller }) func adminEditArtistProfile(id : Text, input : SaveArtistProfileInput) : async () {
    requireAdminOrTeam(caller);

    switch (artistProfiles.get(id)) {
      case (null) {
        Runtime.trap("Artist profile not found");
      };
      case (?profile) {
        if (input.instagramLink == "" or not isValidUrl(input.instagramLink)) {
          Runtime.trap("Instagram link is required and must be a valid URL");
        };
        if (input.facebookLink == "" or not isValidUrl(input.facebookLink)) {
          Runtime.trap("Facebook link is required and must be a valid URL");
        };
        let updatedProfile = {
          profile with
          fullName = input.fullName;
          stageName = input.stageName;
          email = input.email;
          mobileNumber = input.mobileNumber;
          instagramLink = input.instagramLink;
          facebookLink = input.facebookLink;
          spotifyProfile = input.spotifyProfile;
          appleProfile = input.appleProfile;
          profilePhoto = input.profilePhoto;
        };
        artistProfiles.add(id, updatedProfile);
      };
    };
  };

  // Admin/Team can delete any artist profile by ID
  public shared ({ caller }) func adminDeleteArtistProfile(id : Text) : async () {
    requireAdminOrTeam(caller);

    if (not artistProfiles.containsKey(id)) {
      Runtime.trap("Artist profile not found");
    };
    artistProfiles.remove(id);
  };

  // Query all distinct users who have created at least one artist profile
  public query ({ caller }) func getAllArtistProfileOwnersForAdmin() : async [Principal] {
    requireAdminOrTeam(caller);

    let ownersSet = Set.empty<Principal>();

    for (profile in artistProfiles.values()) {
      ownersSet.add(profile.owner);
    };

    ownersSet.toArray();
  };

  // Query all artist profiles for a specific user
  public query ({ caller }) func getArtistProfilesByUserForAdmin(user : Principal) : async [ArtistProfile] {
    requireAdminOrTeam(caller);

    artistProfiles.values().toArray().filter(
      func(profile) { profile.owner == user }
    );
  };

  // ================================
  // MISSING COMPONENT FUNCTIONS
  // ================================

  public shared ({ caller }) func generateInviteCode() : async Text {
    requireAdmin(caller);
    let blob = await Random.blob();
    let code = InviteLinksModule.generateUUID(blob);
    InviteLinksModule.generateInviteCode(inviteState, code);
    code;
  };

  public shared ({ caller }) func submitRSVP(name : Text, attending : Bool, inviteCode : Text) : async () {
    requireUser(caller);
    InviteLinksModule.submitRSVP(inviteState, name, attending, inviteCode);
  };

  public query ({ caller }) func getAllRSVPs() : async [InviteLinksModule.RSVP] {
    requireAdmin(caller);
    InviteLinksModule.getAllRSVPs(inviteState);
  };

  public query ({ caller }) func getInviteCodes() : async [InviteLinksModule.InviteCode] {
    requireAdmin(caller);
    InviteLinksModule.getInviteCodes(inviteState);
  };

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

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    requireUser(caller);
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    requireUser(caller);
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

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
    requireAdmin(caller);
    UserApproval.listApprovals(approvalState);
  };

  // Artist profile editing access control
  public query ({ caller }) func isArtistProfileEditingEnabled() : async Bool {
    requireUser(caller);
    artistProfileEditingAccessEnabled;
  };

  public shared ({ caller }) func setArtistProfileEditingAccess(enabled : Bool) : async () {
    requireAdmin(caller);
    artistProfileEditingAccessEnabled := enabled;
  };

  public query ({ caller }) func getArtistProfileEditingAccessStatus() : async Bool {
    requireUser(caller);
    artistProfileEditingAccessEnabled;
  };

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    requireUser(caller);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    requireUser(caller);
    userProfiles.add(caller, profile);
  };
};
