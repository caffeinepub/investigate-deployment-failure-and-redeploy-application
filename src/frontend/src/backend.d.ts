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
export interface PodcastShow {
    id: string;
    podcastType: PodcastType;
    title: string;
    createdBy: Principal;
    description: string;
    artwork: ExternalBlob;
    language: Language;
    timestamp: Time;
    category: PodcastCategory;
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
export interface PodcastEpisodeInput {
    isPromotional: boolean;
    title: string;
    isEighteenPlus: boolean;
    thumbnail: ExternalBlob;
    showId: string;
    description: string;
    artwork: ExternalBlob;
    seasonNumber: bigint;
    episodeNumber: bigint;
    episodeType: EpisodeType;
    mediaFile: ExternalBlob;
    isExplicit: boolean;
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
export interface PodcastShowInput {
    podcastType: PodcastType;
    title: string;
    description: string;
    artwork: ExternalBlob;
    language: Language;
    category: PodcastCategory;
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
export interface PodcastEpisode {
    id: string;
    isPromotional: boolean;
    title: string;
    isEighteenPlus: boolean;
    thumbnail: ExternalBlob;
    showId: string;
    createdBy: Principal;
    description: string;
    artwork: ExternalBlob;
    seasonNumber: bigint;
    episodeNumber: bigint;
    episodeType: EpisodeType;
    mediaFile: ExternalBlob;
    timestamp: Time;
    isExplicit: boolean;
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
export enum EpisodeType {
    full = "full",
    trailer = "trailer",
    bonus = "bonus"
}
export enum Language {
    tamil = "tamil",
    hindi = "hindi",
    other = "other",
    marathi = "marathi",
    gujarati = "gujarati",
    punjabi = "punjabi",
    malayalam = "malayalam",
    kannada = "kannada",
    telugu = "telugu",
    bengali = "bengali",
    english = "english"
}
export enum PodcastCategory {
    kidsFamily = "kidsFamily",
    music = "music",
    newsPolitics = "newsPolitics",
    other = "other",
    arts = "arts",
    education = "education",
    religionSpirituality = "religionSpirituality",
    healthFitness = "healthFitness",
    tvFilm = "tvFilm",
    technology = "technology",
    business = "business",
    sports = "sports",
    comedy = "comedy",
    science = "science"
}
export enum PodcastType {
    audio = "audio",
    video = "video"
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
    createPodcastEpisode(input: PodcastEpisodeInput): Promise<string>;
    createPodcastShow(input: PodcastShowInput): Promise<string>;
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
    getAllEpisodes(): Promise<Array<PodcastEpisode>>;
    getAllPodcasts(): Promise<Array<PodcastShow>>;
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
    getPodcastEpisodesByShow(showId: string): Promise<Array<PodcastEpisode>>;
    getPodcastEpisodesByUser(): Promise<Array<[PodcastShow, Array<PodcastEpisode>]>>;
    getPodcastShow(showId: string): Promise<PodcastShow | null>;
    getPodcastShowWithEpisodes(showId: string): Promise<[PodcastShow, Array<PodcastEpisode>] | null>;
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
