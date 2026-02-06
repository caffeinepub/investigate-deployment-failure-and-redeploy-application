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
export interface UserProfile {
    name: string;
    artistId: string;
}
export interface ArtistProfile {
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
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface SubmitSongInput {
    artworkBlob: ExternalBlob;
    title: string;
    additionalDetails: string;
    lyricist: string;
    discountCode?: string;
    artworkFilename: string;
    audioBlob: ExternalBlob;
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
export interface BlogPostInput {
    media?: ExternalBlob;
    title: string;
    content: string;
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
export interface InviteCode {
    created: Time;
    code: string;
    used: boolean;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
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
export interface PreSaveInput {
    preSaveLink: string;
    songId: string;
}
export interface CommunityMessageInput {
    content: string;
}
export interface CommunityMessage {
    id: string;
    content: string;
    role: string;
    user: Principal;
    fullName: string;
    timestamp: Time;
}
export interface BlogPost {
    id: string;
    media?: ExternalBlob;
    status: Variant_published_draft;
    title: string;
    content: string;
    author: Principal;
    timestamp: Time;
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
export interface RSVP {
    name: string;
    inviteCode: string;
    timestamp: Time;
    attending: boolean;
}
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface VerificationRequestWithFullName {
    id: string;
    status: VerificationStatus;
    expiryExtensionDays: bigint;
    user: Principal;
    fullName: string;
    verificationApprovedTimestamp?: Time;
    timestamp: Time;
}
export interface ACRResult {
    music: string;
    statusCode: string;
}
export interface SongSubmission {
    id: string;
    status: SongStatus;
    title: string;
    preSaveLink?: string;
    additionalDetails: string;
    lyricist: string;
    submitter: Principal;
    discountCode?: string;
    artworkFilename: string;
    audioFile: ExternalBlob;
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
export interface VerificationRequest {
    id: string;
    status: VerificationStatus;
    expiryExtensionDays: bigint;
    user: Principal;
    verificationApprovedTimestamp?: Time;
    timestamp: Time;
}
export enum AppUserRole {
    admin = "admin",
    team = "team",
    user = "user"
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum SongStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected",
    draft = "draft"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_published_draft {
    published = "published",
    draft = "draft"
}
export enum VerificationStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected",
    waiting = "waiting"
}
export interface backendInterface {
    addSongComment(songId: string, comment: string): Promise<void>;
    adminEditArtistProfile(artist: Principal, update: ArtistProfile): Promise<void>;
    adminEditSubmission(update: SongSubmission): Promise<void>;
    applyForVerification(): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelVerificationRequest(): Promise<void>;
    createBlogPost(input: BlogPostInput): Promise<string>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createPreSave(input: PreSaveInput): Promise<string>;
    deleteBlogPost(id: string): Promise<void>;
    deletePreSaveLink(songId: string): Promise<void>;
    deleteSubmission(id: string): Promise<void>;
    deleteUser(user: Principal): Promise<void>;
    downgradeTeamToUser(user: Principal): Promise<void>;
    generateInviteCode(): Promise<string>;
    getAcrCloudResult(songId: string): Promise<ACRResult | null>;
    getAllArtists(): Promise<Array<ArtistProfile>>;
    getAllArtistsWithUserIds(): Promise<Array<[Principal, ArtistProfile]>>;
    getAllBlogPosts(): Promise<Array<BlogPost>>;
    getAllRSVPs(): Promise<Array<RSVP>>;
    getAllSubmissions(): Promise<Array<SongSubmission>>;
    getAllSubmissionsWithPreSaveLinks(): Promise<Array<SongSubmission>>;
    getAllTeamMembers(): Promise<Array<Principal>>;
    getAllVerificationRequests(): Promise<Array<VerificationRequestWithFullName>>;
    getAllVerificationRequestsForMigration(): Promise<Array<VerificationRequestWithFullName>>;
    getAllVerificationRequestsRaw(): Promise<Array<VerificationRequest>>;
    getAnnouncement(): Promise<string>;
    getAnnualMaintenanceFee(): Promise<bigint>;
    getArtistProfile(): Promise<ArtistProfile | null>;
    getArtistProfileByUserId(user: Principal): Promise<ArtistProfile | null>;
    getArtistProfileEditingAccessStatus(): Promise<boolean>;
    getBlogPost(id: string): Promise<BlogPost | null>;
    getCallerRole(): Promise<AppUserRole>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCommunityMessages(): Promise<Array<CommunityMessage>>;
    getDashboardSummary(): Promise<string>;
    getDistributionFee(): Promise<bigint>;
    getInviteCodes(): Promise<Array<InviteCode>>;
    getNextBatchOfMessages(pageNumber: bigint): Promise<Array<CommunityMessage>>;
    getPreSaveLink(songId: string): Promise<string | null>;
    getPreloadedCommunityMessages(): Promise<Array<CommunityMessage>>;
    getPublishedBlogPosts(): Promise<Array<BlogPost>>;
    getSongComment(songId: string): Promise<string>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getSubmission(id: string): Promise<SongSubmission>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserRole(user: Principal): Promise<AppUserRole>;
    getUserSubmissions(): Promise<Array<SongSubmission>>;
    getVerificationStatus(): Promise<VerificationStatus>;
    hasCompleteArtistProfile(): Promise<boolean>;
    isArtistProfileEditingEnabled(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    isCallerTeamMember(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    isUserVerificationBadgeActive(userId: Principal): Promise<boolean>;
    isVerificationBadgeActive(): Promise<boolean>;
    isVerificationBadgeActiveWithExtensions(user: Principal): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    publishBlogPost(id: string): Promise<void>;
    requestApproval(): Promise<void>;
    saveArtistProfile(input: SaveArtistProfileInput): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendCommunityMessage(input: CommunityMessageInput): Promise<string>;
    setAcrResult(songId: string, acrResult: ACRResult): Promise<void>;
    setAnnualMaintenanceFee(fee: bigint): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    setArtistProfileEditingAccess(enabled: boolean): Promise<void>;
    setDistributionFee(fee: bigint): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    submitRSVP(name: string, attending: boolean, inviteCode: string): Promise<void>;
    submitSong(data: SubmitSongInput): Promise<string>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateAnnouncement(announcement: string): Promise<void>;
    updateBlogPost(id: string, input: BlogPostInput): Promise<void>;
    updateSongSubmission(updatedSubmission: SongSubmission): Promise<void>;
    updateSubmissionStatus(id: string, status: SongStatus, remarks: string): Promise<void>;
    updateVerificationExpiryDays(userId: Principal, extraDays: bigint): Promise<void>;
    updateVerificationStatus(userId: Principal, newStatus: VerificationStatus): Promise<void>;
    updateVerificationStatusWithData(id: string, status: VerificationStatus): Promise<void>;
    upgradeUserToTeam(user: Principal): Promise<void>;
}
