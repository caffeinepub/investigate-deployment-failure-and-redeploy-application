import Map "mo:core/Map";
import Text "mo:core/Text";
import Storage "blob-storage/Storage";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import List "mo:core/List";

module {
  type SongStatus = {
    #pending;
    #approved;
    #rejected;
    #draft;
    #live;
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

  type SongSubmissionOld = {
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
    liveStreamLink : ?Text;
    musicVideoLink : ?Text;
    albumTracks : ?[TrackMetadata];
    publicLink : ?Text;
    adminLiveLink : ?Text;
    isManuallyRejected : Bool;
  };

  type SongSubmissionNew = {
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
    liveStreamLink : ?Text;
    musicVideoLink : ?Text;
    albumTracks : ?[TrackMetadata];
    publicLink : ?Text;
    adminLiveLink : ?Text;
    isManuallyRejected : Bool;
    // New fields
    spotifyLink : ?Text;
    appleMusicLink : ?Text;
  };

  type OldActor = {
    submissions : Map.Map<Text, SongSubmissionOld>;
  };

  type NewActor = {
    submissions : Map.Map<Text, SongSubmissionNew>;
  };

  public func run(old : OldActor) : NewActor {
    let newSubmissions = old.submissions.map<Text, SongSubmissionOld, SongSubmissionNew>(
      func(_id, oldSubmission) {
        {
          oldSubmission with
          spotifyLink = null;
          appleMusicLink = null;
        };
      }
    );
    { submissions = newSubmissions };
  };
};
