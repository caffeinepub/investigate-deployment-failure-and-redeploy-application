import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface ArtistProfile {
    id: string;
    isApproved: boolean;
    instagramLink: string;
    owner: Principal;
    profilePhoto: ExternalBlob;
    fullName: string;
    mobileNumber: string;
    email: string;
    spotifyProfile: string;
    facebookLink: string;
    appleProfile: string;
    stageName: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface SubmitSongInput {
    artworkBlob: ExternalBlob;
    albumTracks?: Array<TrackMetadata>;
    title: string;
    additionalDetails: string;
    lyricist: string;
    publicLink?: string;
    discountCode?: string;
    artworkFilename: string;
    audioBlob: ExternalBlob;
    liveStreamLink?: string;
    audioFilename: string;
    language: string;
    composer: string;
    genre: string;
    artist: string;
    producer: string;
    releaseDate: Time;
    releaseType: string;
    featuredArtist: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface SaveArtistProfileInput {
    isApproved: boolean;
    instagramLink: string;
    profilePhoto: ExternalBlob;
    fullName: string;
    mobileNumber: string;
    email: string;
    spotifyProfile: string;
    facebookLink: string;
    appleProfile: string;
    stageName: string;
}
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface RSVP {
    name: string;
    inviteCode: string;
    timestamp: Time;
    attending: boolean;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface InviteCode {
    created: Time;
    code: string;
    used: boolean;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface ACRResult {
    music: string;
    statusCode: string;
}
export interface TrackMetadata {
    title: string;
    lyricist: string;
    audioFile: ExternalBlob;
    audioFilename: string;
    composer: string;
    artist: string;
    producer: string;
    featuredArtist: string;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface SongSubmission {
    id: string;
    status: SongStatus;
    albumTracks?: Array<TrackMetadata>;
    title: string;
    preSaveLink?: string;
    additionalDetails: string;
    lyricist: string;
    publicLink?: string;
    submitter: Principal;
    discountCode?: string;
    artworkFilename: string;
    audioFile: ExternalBlob;
    liveStreamLink?: string;
    artwork: ExternalBlob;
    audioFilename: string;
    language: string;
    composer: string;
    adminComment: string;
    genre: string;
    timestamp: Time;
    artist: string;
    acrResult?: ACRResult;
    producer: string;
    releaseDate: Time;
    releaseType: string;
    adminRemarks: string;
    featuredArtist: string;
}
export interface UserProfile {
    name: string;
    artistId: string;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum SongStatus {
    pending = "pending",
    live = "live",
    approved = "approved",
    rejected = "rejected",
    draft = "draft"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminDeleteArtistProfile(id: string): Promise<void>;
    adminDeleteSubmission(id: string): Promise<void>;
    adminEditArtistProfile(id: string, input: SaveArtistProfileInput): Promise<void>;
    adminUpdateSubmission(id: string, status: SongStatus, adminRemarks: string, adminComment: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createArtistProfile(input: SaveArtistProfileInput): Promise<string>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    deleteArtistProfile(id: string): Promise<void>;
    generateInviteCode(): Promise<string>;
    getAllArtistProfileOwnersForAdmin(): Promise<Array<Principal>>;
    getAllArtistProfilesForAdmin(): Promise<Array<ArtistProfile>>;
    getAllRSVPs(): Promise<Array<RSVP>>;
    getAllSubmissionsForAdmin(): Promise<Array<SongSubmission>>;
    getArtistProfileEditingAccessStatus(): Promise<boolean>;
    getArtistProfilesByUserForAdmin(user: Principal): Promise<Array<ArtistProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getInviteCodes(): Promise<Array<InviteCode>>;
    getMyArtistProfiles(): Promise<Array<ArtistProfile>>;
    getMySubmissions(): Promise<Array<SongSubmission>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isArtistProfileEditingEnabled(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    setArtistProfileEditingAccess(enabled: boolean): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    submitRSVP(name: string, attending: boolean, inviteCode: string): Promise<void>;
    submitSong(input: SubmitSongInput): Promise<string>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateArtistProfile(id: string, input: SaveArtistProfileInput): Promise<void>;
}
