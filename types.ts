export interface ProofreadError {
  original: string;
  correction: string;
  explanation:string;
}

export interface Suggestion extends ProofreadError {
  id: number;
  status: 'pending' | 'accepted' | 'ignored';
}

export interface GitBookOrganization {
  id: string;
  title: string;
}

export interface GitBookSpace {
  id: string;
  title: string;
}

export interface GitBookPage {
  id: string;
  title: string;
  spaceId: string;
  spaceTitle: string;
}

export interface AnalysisResult {
  page: GitBookPage;
  suggestions: Suggestion[];
  originalText: string;
}

export interface SummaryResult {
  title: string;
  originalText: string;
  summary: string;
}
