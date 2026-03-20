export interface KOLBrief {
  id: string;
  kolName: string;
  credentials: string;
  institution: string;
  department: string;
  email: string;
  specialties: string[];
  focusAreas: string[];
  leadershipPositions: LeadershipPosition[];
  metrics: PublicationMetrics;
  executiveSummary: string;
  professionalBackground: string;
  expertiseAndResearch: string;
  notableAchievements: string;
  recentWork: string;
  conversationStarters: ConversationStarter[];
  generatedAt: string;
  status: 'generating' | 'complete' | 'error';
  appVersion: string;
  headshotUrl?: string;
  hidden: boolean;
  hiddenAt?: string;
  hiddenBy?: string;
  cost?: BriefCost;
  evidence?: EvidenceMetadata;
  disclaimer?: string;
  npi?: string;
  conference?: string;
  conferenceSessions?: string[];
  priority?: Priority;
  notes?: string;
}

export interface LeadershipPosition {
  title: string;
  organization: string;
  current: boolean;
}

export interface PublicationMetrics {
  publications: number | string;
  citations: number | string;
  hIndex: number | string;
}

export interface ConversationStarter {
  title: string;
  body: string;
  question: string;
}

export type Priority = 'high' | 'medium' | 'low';

export interface GenerateBriefRequest {
  kolName: string;
  institution?: string;
  specialty?: string;
  additionalContext?: string;
  headshotUrl?: string;
  npi?: string;
  conference?: string;
  priority?: Priority;
}

export interface GenerateBriefResponse {
  success: boolean;
  brief?: KOLBrief;
  error?: string;
}

export interface BriefSummary {
  id: string;
  kolName: string;
  institution: string;
  specialties: string[];
  focusAreas: string[];
  generatedAt: string;
  appVersion: string;
  headshotUrl?: string;
  hidden: boolean;
  cost?: BriefCost;
  evidenceLevel?: EvidenceLevel;
  npi?: string;
  conference?: string;
  conferenceSessions?: string[];
  priority?: Priority;
  notes?: string;
}

export interface BriefCost {
  inputTokens: number;
  outputTokens: number;
  inputCostUsd: number;
  outputCostUsd: number;
  totalCostUsd: number;
  model: string;
  webSearchRequests?: number;
  webSearchCostUsd?: number;
}

// Evidence metadata stored with each brief
export interface WebSearchCitation {
  url: string;
  title: string;
  citedText?: string;
}

export type EvidenceLevel = 'high' | 'moderate' | 'low' | 'minimal';

export interface EvidenceMetadata {
  evidenceLevel: EvidenceLevel;
  pubmedPublications: number;
  webSearchesPerformed: number;
  citations: WebSearchCitation[];
  researchFetchedAt: string;
}

// NPI provider data from NPPES Registry
export interface NpiProviderData {
  npi: string;
  firstName: string;
  lastName: string;
  credential: string;
  taxonomies: { code: string; description: string; primary: boolean }[];
  addresses: { city: string; state: string; postalCode: string }[];
}

// Batch import types
export interface BatchKolRow {
  kolName: string;
  institution?: string;
  specialty?: string;
  additionalContext?: string;
  headshotUrl?: string;
  npi?: string;
  conference?: string;
  priority?: Priority;
}

export type BatchItemStatus = 'pending' | 'generating' | 'complete' | 'error';

export interface BatchItem {
  id: string;
  row: BatchKolRow;
  status: BatchItemStatus;
  selected: boolean;
  briefId?: string;
  cost?: BriefCost;
  error?: string;
  elapsedSeconds?: number;
}

export interface UserContext {
  email: string;
  isAdmin: boolean;
}
