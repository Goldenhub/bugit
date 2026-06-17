export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'open' | 'in-progress' | 'resolved' | 'wontfix';
export type Source = 'cli' | 'web' | 'extension';

export interface Bug {
  _id: string;
  title: string;
  description: string;
  severity: Severity;
  status: Status;
  project: string;
  environment: string;
  source: Source;
  tags: string[];
  notes: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Comment {
  _id: string;
  bugId: string;
  body: string;
  createdAt: string;
}

export interface BugListResponse {
  bugs: Bug[];
  total: number;
  page: number;
  limit: number;
}

export interface Stats {
  total: number;
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
  byProject: Record<string, number>;
}
