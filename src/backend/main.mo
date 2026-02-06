import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Storage "blob-storage/Storage";
import Random "mo:core/Random";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import InviteLinksModule "invite-links/invite-links-module";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import UserApproval "user-approval/approval";

// Use migration function via "with" clause
(with migration = Migration.run)
actor {
  public type SongStatus = { #pending; #approved; #rejected; #draft };
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

  include MixinStorage();

  let submissions = Map.empty<Text, SongSubmission>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let artistProfiles = Map.empty<Principal, ArtistProfile>();
  let verificationRequests = Map.empty<Text, VerificationRequest>();
  let teamMembers = Map.empty<Principal, Bool>();
  let blogPosts = Map.empty<Text, BlogPost>();
  let communityMessages = Map.empty<Text, CommunityMessage>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let approvalState = UserApproval.initState(accessControlState);
  let inviteState = InviteLinksModule.initState();

  var distributionFee : Int = 199;
  var annualMaintenanceFee : Int = 1000;
  var stripeConfiguration : ?Stripe.StripeConfiguration = null;
  var globalAnnouncement : Text = "";
  var lastVerificationCheckTime : Time.Time = 0;
  var artistProfileEditingAccessEnabled : Bool = true;

  // Helper functions for team role management
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
    switch (artistProfiles.get(user)) {
      case (null) { "Anonymous User" };
      case (?profile) { profile.fullName };
    };
  };

  // Artist profile editing access control
  public query ({ caller }) func isArtistProfileEditingEnabled() : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can perform this action");
    };
    artistProfileEditingAccessEnabled;
  };

  public shared ({ caller }) func setArtistProfileEditingAccess(enabled : Bool) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    artistProfileEditingAccessEnabled := enabled;
  };

  public query ({ caller }) func getArtistProfileEditingAccessStatus() : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can perform this action");
    };
    artistProfileEditingAccessEnabled;
  };

  // Team role management functions
  public shared ({ caller }) func upgradeUserToTeam(user : Principal) : async () {
    requireAdmin(caller);
    if (user.isAnonymous()) {
      Runtime.trap("Cannot upgrade anonymous principal to team member");
    };
    if (AccessControl.isAdmin(accessControlState, user)) {
      Runtime.trap("User is already an admin");
    };
    teamMembers.add(user, true);
  };

  public shared ({ caller }) func downgradeTeamToUser(user : Principal) : async () {
    requireAdmin(caller);
    if (not isTeamMember(user)) {
      Runtime.trap("User is not a team member");
    };
    teamMembers.remove(user);
  };

  public query ({ caller }) func getUserRole(user : Principal) : async AppUserRole {
    requireUser(caller);
    if (AccessControl.isAdmin(accessControlState, user)) {
      #admin;
    } else if (isTeamMember(user)) {
      #team;
    } else {
      #user;
    };
  };

  public query ({ caller }) func getCallerRole() : async AppUserRole {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      #admin;
    } else if (isTeamMember(caller)) {
      #team;
    } else {
      #user;
    };
  };

  public query ({ caller }) func isCallerTeamMember() : async Bool {
    isTeamMember(caller);
  };

  public query ({ caller }) func getAllTeamMembers() : async [Principal] {
    requireAdmin(caller);
    teamMembers.keys().toArray();
  };

  public query ({ caller }) func getDistributionFee() : async Int {
    requireUser(caller);
    distributionFee;
  };

  public query ({ caller }) func getAnnualMaintenanceFee() : async Int {
    requireUser(caller);
    annualMaintenanceFee;
  };

  public shared ({ caller }) func setDistributionFee(fee : Int) : async () {
    requireAdmin(caller);
    distributionFee := fee;
  };

  public shared ({ caller }) func setAnnualMaintenanceFee(fee : Int) : async () {
    requireAdmin(caller);
    annualMaintenanceFee := fee;
  };

  public query ({ caller }) func isStripeConfigured() : async Bool {
    requireAdmin(caller);
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

  public query ({ caller }) func getArtistProfile() : async ?ArtistProfile {
    requireUser(caller);
    let profile = artistProfiles.get(caller);
    switch (profile) {
      case (null) { null };
      case (?p) { ?p };
    };
  };

  public query ({ caller }) func hasCompleteArtistProfile() : async Bool {
    artistProfiles.containsKey(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    requireUser(caller);
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func saveArtistProfile(input : SaveArtistProfileInput) : async () {
    requireUser(caller);
    let profile : ArtistProfile = {
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
    artistProfiles.add(caller, profile);
  };

  public shared ({ caller }) func submitSong(data : SubmitSongInput) : async Text {
    requireUser(caller);

    let artistProfile = artistProfiles.get(caller);
    switch (artistProfile) {
      case (null) {
        Runtime.trap("You must complete your artist profile before submitting songs");
      };
      case (?_) {
        let blob = await Random.blob();
        let id = InviteLinksModule.generateUUID(blob);

        let submission : SongSubmission = {
          id;
          title = data.title;
          language = data.language;
          releaseDate = data.releaseDate;
          releaseType = data.releaseType;
          genre = data.genre;
          artwork = data.artworkBlob;
          artworkFilename = data.artworkFilename;
          artist = data.artist;
          featuredArtist = data.featuredArtist;
          composer = data.composer;
          producer = data.producer;
          lyricist = data.lyricist;
          audioFile = data.audioBlob;
          audioFilename = data.audioFilename;
          additionalDetails = data.additionalDetails;
          status = #pending;
          adminRemarks = "";
          adminComment = "";
          submitter = caller;
          timestamp = Time.now();
          discountCode = data.discountCode;
          acrResult = null;
          preSaveLink = null;
        };
        submissions.add(id, submission);
        id;
      };
    };
  };

  public shared ({ caller }) func updateSongSubmission(updatedSubmission : SongSubmission) : async () {
    requireUser(caller);

    let existingSubmission = submissions.get(updatedSubmission.id);
    let artistProfile = artistProfiles.get(caller);

    switch (existingSubmission) {
      case (null) {
        Runtime.trap("Submission not found");
      };
      case (?existing) {
        if (existing.submitter != caller) {
          Runtime.trap("Unauthorized: You can only edit your own submissions");
        };

        switch (artistProfile) {
          case (null) {
            Runtime.trap("You must complete your artist profile before editing submissions");
          };
          case (?_) {
            switch (existing.status) {
              case (#pending) {
                submissions.add(updatedSubmission.id, updatedSubmission);
              };
              case (#rejected) {
                submissions.add(updatedSubmission.id, updatedSubmission);
              };
              case (#draft) {
                submissions.add(updatedSubmission.id, updatedSubmission);
              };
              case (#approved) {
                Runtime.trap("Cannot edit submission after approval");
              };
            };
          };
        };
      };
    };
  };

  public query ({ caller }) func getUserSubmissions() : async [SongSubmission] {
    requireUser(caller);
    submissions.values().toArray().filter(
      func(submission) { submission.submitter == caller }
    );
  };

  public query ({ caller }) func getAllSubmissions() : async [SongSubmission] {
    requireAdminOrTeam(caller);
    submissions.values().toArray();
  };

  public shared ({ caller }) func updateSubmissionStatus(
    id : Text,
    status : SongStatus,
    remarks : Text,
  ) : async () {
    requireAdminOrTeam(caller);
    if (not submissions.containsKey(id)) {
      Runtime.trap("Submission not found");
    };
    let current = getMandatorySubmission(id);

    let finalStatus = switch (status) {
      case (#rejected) { #draft };
      case (_) { status };
    };

    submissions.add(id, {
      current with
      status = finalStatus;
      adminRemarks = remarks;
    });
  };

  public shared ({ caller }) func deleteSubmission(id : Text) : async () {
    requireAdmin(caller);
    if (not submissions.containsKey(id)) {
      Runtime.trap("Submission not found");
    };
    submissions.remove(id);
  };

  public query ({ caller }) func getSubmission(id : Text) : async SongSubmission {
    let submission = getMandatorySubmission(id);
    if (caller != submission.submitter and not isAdminOrTeam(caller)) {
      Runtime.trap("Unauthorized: Can only view your own submissions");
    };
    submission;
  };

  public query ({ caller }) func getDashboardSummary() : async Text {
    requireAdminOrTeam(caller);
    let total = submissions.size();
    let approved = submissions.values().toArray().filter(
      func(submission) { submission.status == #approved }
    ).size();
    let pending = submissions.values().toArray().filter(
      func(submission) { submission.status == #pending }
    ).size();
    let rejected = submissions.values().toArray().filter(
      func(submission) { submission.status == #rejected }
    ).size();
    "Total: " # total.toText() # ", Approved: " # approved.toText() # ", Pending: " # pending.toText() # ", Rejected: " # rejected.toText();
  };

  func getMandatorySubmission(id : Text) : SongSubmission {
    switch (submissions.get(id)) {
      case (null) { Runtime.trap("SongSubmission does not exist") };
      case (?submission) { submission };
    };
  };

  public shared ({ caller }) func generateInviteCode() : async Text {
    requireAdmin(caller);
    let blob = await Random.blob();
    let code = InviteLinksModule.generateUUID(blob);
    InviteLinksModule.generateInviteCode(inviteState, code);
    code;
  };

  public shared ({ caller }) func submitRSVP(name : Text, attending : Bool, inviteCode : Text) : async () {
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

  public query ({ caller }) func getArtistProfileByUserId(user : Principal) : async ?ArtistProfile {
    requireUser(caller);
    artistProfiles.get(user);
  };

  public query ({ caller }) func getAllArtists() : async [ArtistProfile] {
    requireUser(caller);
    artistProfiles.values().toArray();
  };

  public query ({ caller }) func getAllArtistsWithUserIds() : async [(Principal, ArtistProfile)] {
    requireUser(caller);
    artistProfiles.toArray();
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    requireUser(caller);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    requireUser(caller);
    userProfiles.get(user);
  };

  public shared ({ caller }) func adminEditSubmission(update : SongSubmission) : async () {
    requireAdmin(caller);
    if (update.id == "") {
      Runtime.trap("Invalid submission: ID cannot be empty");
    };
    switch (submissions.get(update.id)) {
      case (null) {
        Runtime.trap("Submission not found");
      };
      case (?existing) {
        submissions.add(update.id, {
          update with
          submitter = existing.submitter;
          timestamp = Time.now();
        });
      };
    };
  };

  public shared ({ caller }) func adminEditArtistProfile(artist : Principal, update : ArtistProfile) : async () {
    requireAdmin(caller);
    if (artist.isAnonymous()) {
      Runtime.trap("Invalid artist: Cannot modify anonymous principal");
    };
    switch (artistProfiles.get(artist)) {
      case (null) {
        Runtime.trap("Artist profile not found");
      };
      case (?_) {
        artistProfiles.add(artist, update);
      };
    };
  };

  public shared ({ caller }) func updateAnnouncement(announcement : Text) : async () {
    requireAdmin(caller);
    globalAnnouncement := announcement;
  };

  public query ({ caller }) func getAnnouncement() : async Text {
    requireUser(caller);
    globalAnnouncement;
  };

  public shared ({ caller }) func addSongComment(songId : Text, comment : Text) : async () {
    requireAdminOrTeam(caller);
    switch (submissions.get(songId)) {
      case (null) {
        Runtime.trap("SongSubmission with id " # songId # " does not exist");
      };
      case (?submission) {
        submissions.add(
          songId,
          {
            submission with
            adminComment = comment;
          },
        );
      };
    };
  };

  public query ({ caller }) func getSongComment(songId : Text) : async Text {
    requireUser(caller);
    switch (submissions.get(songId)) {
      case (null) {
        Runtime.trap("SongSubmission with id " # songId # " does not exist");
      };
      case (?submission) {
        if (caller != submission.submitter and not isAdminOrTeam(caller)) {
          Runtime.trap("Unauthorized: Can only view comments on your own submissions");
        };
        submission.adminComment;
      };
    };
  };

  // Verification Subscription
  public query ({ caller }) func getVerificationStatus() : async VerificationStatus {
    requireUser(caller);
    switch (verificationRequests.values().find(func(req) { req.user == caller })) {
      case (null) { #rejected };
      case (?req) { req.status };
    };
  };

  public query ({ caller }) func getAllVerificationRequestsRaw() : async [VerificationRequest] {
    requireAdmin(caller);
    verificationRequests.values().toArray();
  };

  func withFullName(request : VerificationRequest) : VerificationRequestWithFullName {
    let fullName = switch (artistProfiles.get(request.user)) {
      case (null) { "Name not available" };
      case (?profile) { profile.fullName };
    };
    {
      request with
      fullName;
    };
  };

  public query ({ caller }) func getAllVerificationRequests() : async [VerificationRequestWithFullName] {
    requireAdmin(caller);
    verificationRequests.values().toArray().map(withFullName);
  };

  public shared ({ caller }) func applyForVerification() : async () {
    requireUser(caller);
    let existingRequest = verificationRequests.values().find(func(req) {
      req.user == caller and (req.status == #pending or req.status == #approved or req.status == #waiting)
    });

    switch (existingRequest) {
      case (?_) {
        Runtime.trap("You have already initiated a verification request or are in the waiting list");
      };
      case (null) {
        let blob = await Random.blob();
        let id = InviteLinksModule.generateUUID(blob);
        let verificationRequest : VerificationRequest = {
          id;
          user = caller;
          status = #waiting;
          timestamp = Time.now();
          verificationApprovedTimestamp = null;
          expiryExtensionDays = 0;
        };
        verificationRequests.add(id, verificationRequest);
      };
    };
  };

  func updateVerificationExpirations() {
    let currentTime = Time.now();
    let needsUpdate = currentTime - lastVerificationCheckTime > 10_000_000_000;

    if (not needsUpdate) {
      return;
    };

    let requests = verificationRequests.toArray();
    for (entry in requests.values()) {
      let id = entry.0;
      let request = entry.1;

      let isExpired = switch (request.verificationApprovedTimestamp) {
        case (null) { false };
        case (?approvedTimestamp) {
          let totalDays = 30 + request.expiryExtensionDays;
          let validPeriodNanos = totalDays * 24 * 60 * 60 * 1_000_000_000;
          currentTime - approvedTimestamp > validPeriodNanos;
        };
      };

      if (isExpired) {
        let updatedRequest = {
          request with
          status = #waiting;
          verificationApprovedTimestamp = null;
        };
        verificationRequests.add(id, updatedRequest);
      };
    };
    lastVerificationCheckTime := currentTime;
  };

  public shared ({ caller }) func updateVerificationStatus(userId : Principal, newStatus : VerificationStatus) : async () {
    requireAdmin(caller);

    let existingRequest = verificationRequests.values().find(func(req) { req.user == userId });
    switch (existingRequest) {
      case (null) {
        let blob = await Random.blob();
        let id = InviteLinksModule.generateUUID(blob);

        let verificationRequest : VerificationRequest = {
          id;
          user = userId;
          status = newStatus;
          timestamp = Time.now();
          verificationApprovedTimestamp = if (newStatus == #approved) { ?Time.now() } else { null };
          expiryExtensionDays = 0;
        };

        verificationRequests.add(id, verificationRequest);
      };
      case (?request) {
        let updatedRequest = {
          request with
          status = newStatus;
          verificationApprovedTimestamp = if (newStatus == #approved) { ?Time.now() } else { null };
        };
        verificationRequests.add(request.id, updatedRequest);
      };
    };
  };

  public shared ({ caller }) func updateVerificationStatusWithData(id : Text, status : VerificationStatus) : async () {
    requireAdmin(caller);

    if (not verificationRequests.containsKey(id)) {
      Runtime.trap("Verification request not found");
    };

    let current = getMandatoryVerificationRequest(id);
    verificationRequests.add(id, {
      current with
      status;
      verificationApprovedTimestamp = if (status == #approved) { ?Time.now() } else { null };
    });
  };

  func getMandatoryVerificationRequest(id : Text) : VerificationRequest {
    switch (verificationRequests.get(id)) {
      case (null) { Runtime.trap("Verification request with id " # id # " does not exist") };
      case (?verificationRequest) { verificationRequest };
    };
  };

  public shared ({ caller }) func cancelVerificationRequest() : async () {
    requireUser(caller);

    let requestToRemove = verificationRequests.values().find(func(req) { req.user == caller });
    switch (requestToRemove) {
      case (null) {
        Runtime.trap("No verification request found to cancel");
      };
      case (?request) {
        verificationRequests.remove(request.id);
      };
    };
  };

  public query ({ caller }) func isVerificationBadgeActive() : async Bool {
    requireUser(caller);
    switch (verificationRequests.values().find(func(req) { req.user == caller })) {
      case (null) { false };
      case (?req) {
        switch (req.verificationApprovedTimestamp) {
          case (null) { false };
          case (?approvedTimestamp) {
            let totalDays = 30 + req.expiryExtensionDays;
            let validPeriodNanos = totalDays * 24 * 60 * 60 * 1000000000;
            Time.now() - approvedTimestamp <= validPeriodNanos;
          };
        };
      };
    };
  };

  public query ({ caller }) func isUserVerificationBadgeActive(userId : Principal) : async Bool {
    requireUser(caller);
    switch (verificationRequests.values().find(func(req) { req.user == userId })) {
      case (null) { false };
      case (?req) {
        switch (req.verificationApprovedTimestamp) {
          case (null) { false };
          case (?approvedTimestamp) {
            let totalDays = 30 + req.expiryExtensionDays;
            let validPeriodNanos = totalDays * 24 * 60 * 60 * 1000000000;
            Time.now() - approvedTimestamp <= validPeriodNanos;
          };
        };
      };
    };
  };

  public shared ({ caller }) func deleteUser(user : Principal) : async () {
    requireAdmin(caller);

    if (user.isAnonymous()) {
      Runtime.trap("Cannot delete anonymous principal");
    };

    // Remove user profile
    userProfiles.remove(user);

    // Remove artist profile
    artistProfiles.remove(user);

    // Remove team member status if applicable
    teamMembers.remove(user);

    // Remove all submissions by the user
    let submissionsToRemove = submissions.filter(
      func(_id, submission) {
        submission.submitter == user;
      }
    );

    for ((id, _) in submissionsToRemove.entries()) {
      submissions.remove(id);
    };

    // Remove all verification requests by the user
    let verificationRequestsToRemove = verificationRequests.filter(
      func(_id, request) {
        request.user == user;
      }
    );

    for ((id, _) in verificationRequestsToRemove.entries()) {
      verificationRequests.remove(id);
    };
  };

  // Blog Post System
  public shared ({ caller }) func createBlogPost(input : BlogPostInput) : async Text {
    requireAdminOrTeam(caller);

    let blob = await Random.blob();
    let id = InviteLinksModule.generateUUID(blob);

    let blogPost : BlogPost = {
      id;
      title = input.title;
      content = input.content;
      author = caller;
      timestamp = Time.now();
      media = input.media;
      status = #draft;
    };

    blogPosts.add(id, blogPost);
    id;
  };

  public shared ({ caller }) func updateBlogPost(id : Text, input : BlogPostInput) : async () {
    requireAdminOrTeam(caller);

    switch (blogPosts.get(id)) {
      case (null) {
        Runtime.trap("Blog post not found");
      };
      case (?existing) {
        let updatedPost = {
          existing with
          title = input.title;
          content = input.content;
          media = input.media;
        };
        blogPosts.add(id, updatedPost);
      };
    };
  };

  public shared ({ caller }) func publishBlogPost(id : Text) : async () {
    requireAdminOrTeam(caller);

    switch (blogPosts.get(id)) {
      case (null) {
        Runtime.trap("Blog post not found");
      };
      case (?existing) {
        blogPosts.add(
          id,
          { existing with status = #published },
        );
      };
    };
  };

  public query ({ caller }) func getAllBlogPosts() : async [BlogPost] {
    blogPosts.values().toArray();
  };

  public query func getPublishedBlogPosts() : async [BlogPost] {
    let posts = blogPosts.values().toArray();
    let sortedPosts = posts.sort(
      func(a, b) {
        if (a.timestamp > b.timestamp) { return #less };
        if (a.timestamp < b.timestamp) { return #greater };
        #equal;
      }
    );
    sortedPosts.filter(
      func(post) { post.status == #published }
    );
  };

  public query func getBlogPost(id : Text) : async ?BlogPost {
    blogPosts.get(id);
  };

  public shared ({ caller }) func deleteBlogPost(id : Text) : async () {
    requireAdmin(caller);

    if (not blogPosts.containsKey(id)) {
      Runtime.trap("Blog post not found");
    };
    blogPosts.remove(id);
  };

  public query ({ caller }) func getAllVerificationRequestsForMigration() : async [VerificationRequestWithFullName] {
    requireAdmin(caller);
    verificationRequests.values().toArray().map(
      func(request) {
        {
          request with
          fullName = "";
        };
      }
    );
  };

  public shared ({ caller }) func updateVerificationExpiryDays(userId : Principal, extraDays : Nat) : async () {
    requireAdmin(caller);

    let existingRequest = verificationRequests.values().find(func(req) { req.user == userId });
    switch (existingRequest) {
      case (null) {
        let blob = await Random.blob();
        let id = InviteLinksModule.generateUUID(blob);

        let verificationRequest : VerificationRequest = {
          id;
          user = userId;
          status = #pending;
          timestamp = Time.now();
          verificationApprovedTimestamp = null;
          expiryExtensionDays = extraDays;
        };

        verificationRequests.add(id, verificationRequest);
      };
      case (?request) {
        let updatedRequest = {
          request with
          expiryExtensionDays = extraDays;
        };
        verificationRequests.add(request.id, updatedRequest);
      };
    };
  };

  public query ({ caller }) func isVerificationBadgeActiveWithExtensions(user : Principal) : async Bool {
    requireUser(caller);
    switch (verificationRequests.values().find(func(req) { req.user == user })) {
      case (null) { false };
      case (?req) {
        switch (req.verificationApprovedTimestamp) {
          case (null) { false };
          case (?approvedTimestamp) {
            let totalDays = 30 + req.expiryExtensionDays;
            let validPeriodNanos = totalDays * 24 * 60 * 60 * 1000000000;
            Time.now() - approvedTimestamp <= validPeriodNanos;
          };
        };
      };
    };
  };

  // Community Chat System
  public shared ({ caller }) func sendCommunityMessage(input : CommunityMessageInput) : async Text {
    requireUser(caller);

    let blob = await Random.blob();
    let id = InviteLinksModule.generateUUID(blob);

    let message : CommunityMessage = {
      id;
      user = caller;
      content = input.content;
      timestamp = Time.now();
      role = getUserRoleText(caller);
      fullName = getUserFullName(caller);
    };

    communityMessages.add(id, message);
    id;
  };

  public query ({ caller }) func getCommunityMessages() : async [CommunityMessage] {
    requireUser(caller);
    let messages = communityMessages.values().toArray();
    messages.sort(
      func(a, b) {
        if (a.timestamp < b.timestamp) { return #less };
        if (a.timestamp > b.timestamp) { return #greater };
        #equal;
      }
    );
  };

  public query ({ caller }) func getPreloadedCommunityMessages() : async [CommunityMessage] {
    requireUser(caller);

    let messages = communityMessages.values().toArray();
    let sortedMessages = messages.sort(
      func(a, b) {
        if (a.timestamp < b.timestamp) { return #less };
        if (a.timestamp > b.timestamp) { return #greater };
        #equal;
      }
    );
    let messageCount = sortedMessages.size();
    if (messageCount <= 50) {
      return sortedMessages;
    };

    let startIndex = 0;
    let endIndex = 49;
    Array.tabulate(
      endIndex - startIndex + 1,
      func(i) {
        sortedMessages[startIndex + i];
      },
    );
  };

  public query ({ caller }) func getNextBatchOfMessages(pageNumber : Nat) : async [CommunityMessage] {
    requireUser(caller);

    if (pageNumber < 2) {
      Runtime.trap("Invalid page number: " # pageNumber.toText() # ". Page Number must be greater than or equal to 2. ");
    };

    let messages = communityMessages.values().toArray();
    let sortedMessages = messages.sort(
      func(a, b) {
        if (a.timestamp < b.timestamp) { return #less };
        if (a.timestamp > b.timestamp) { return #greater };
        #equal;
      }
    );

    let messageCount = sortedMessages.size();
    let startIndex = 49 * pageNumber;
    let endIndex = startIndex + 49;

    let actualStartIndex = if (startIndex >= 0) { startIndex } else { 0 };
    let actualEndIndex = if (endIndex < messageCount) { endIndex } else {
      if (messageCount == 0) { 0 } else { messageCount - 1 };
    };

    if (actualStartIndex >= messageCount) {
      return [];
    };

    Array.tabulate(
      actualEndIndex - actualStartIndex + 1,
      func(i) {
        sortedMessages[actualStartIndex + i];
      },
    );
  };

  public shared ({ caller }) func setAcrResult(songId : Text, acrResult : ACRResult) : async () {
    requireAdmin(caller);
    if (songId == "") {
      Runtime.trap("Song ID cannot be empty");
    };
    if (not submissions.containsKey(songId)) {
      Runtime.trap("SongSubmission with id " # songId # " does not exist");
    };
    let current = getMandatorySubmission(songId);
    submissions.add(songId, { current with acrResult = ?acrResult });
  };

  public query ({ caller }) func getAcrCloudResult(songId : Text) : async ?ACRResult {
    requireUser(caller);
    if (songId == "") {
      Runtime.trap("Song ID cannot be empty");
    };
    switch (submissions.get(songId)) {
      case (null) {
        Runtime.trap("SongSubmission with id " # songId # " does not exist");
      };
      case (?submission) {
        if (caller != submission.submitter and not isAdminOrTeam(caller)) {
          Runtime.trap("Unauthorized: Can only view ACR results for your own submissions");
        };
        submission.acrResult;
      };
    };
  };

  public shared ({ caller }) func createPreSave(input : PreSaveInput) : async Text {
    requireAdmin(caller);

    if (input.songId == "") {
      Runtime.trap("Song ID cannot be empty");
    };

    if (input.preSaveLink == "") {
      Runtime.trap("Pre-save link cannot be empty");
    };

    if (not submissions.containsKey(input.songId)) {
      Runtime.trap("SongSubmission with id " # input.songId # " does not exist");
    };

    let current = getMandatorySubmission(input.songId);
    submissions.add(input.songId, {
      current with
      preSaveLink = ?input.preSaveLink;
    });
    input.preSaveLink;
  };

  public shared ({ caller }) func deletePreSaveLink(songId : Text) : async () {
    requireAdmin(caller);
    if (songId == "") {
      Runtime.trap("Song ID cannot be empty");
    };
    if (not submissions.containsKey(songId)) {
      Runtime.trap("SongSubmission with id " # songId # " does not exist");
    };
    let current = getMandatorySubmission(songId);
    submissions.add(songId, { current with preSaveLink = null });
  };

  public query ({ caller }) func getPreSaveLink(songId : Text) : async ?Text {
    requireUser(caller);
    if (songId == "") {
      Runtime.trap("Song ID cannot be empty");
    };
    switch (submissions.get(songId)) {
      case (null) {
        Runtime.trap("SongSubmission with id " # songId # " does not exist");
      };
      case (?submission) {
        if (caller != submission.submitter and not isAdminOrTeam(caller)) {
          Runtime.trap("Unauthorized: Can only view pre-save links for your own submissions");
        };
        submission.preSaveLink;
      };
    };
  };

  public query ({ caller }) func getAllSubmissionsWithPreSaveLinks() : async [SongSubmission] {
    requireAdminOrTeam(caller);
    submissions.values().toArray().filter(
      func(submission) { submission.preSaveLink != null }
    );
  };
};
