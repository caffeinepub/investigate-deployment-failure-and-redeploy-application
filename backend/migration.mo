import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";

module {
  type TopVibingSong = {
    id : Nat;
    title : Text;
    artistName : Text;
    genre : Text;
    artworkUrl : Text;
    streamingLink : Text;
    tagline : ?Text;
    rank : Nat;
  };

  type NewActor = {
    var topVibingSongs : Map.Map<Nat, TopVibingSong>;
    var topVibingSongsSize : Nat;
  };

  public func run(old : {}) : NewActor {
    {
      var topVibingSongs = Map.empty<Nat, TopVibingSong>();
      var topVibingSongsSize = 0;
    };
  };
};
