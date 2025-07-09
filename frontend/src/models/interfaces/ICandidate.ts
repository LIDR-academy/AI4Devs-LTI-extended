import { Candidate } from '../types/Candidate';

export interface ICandidateProps {
  candidate: Candidate;
  onEdit?: (candidate: Candidate) => void;
  onDelete?: (id: number) => void;
  onView?: (id: number) => void;
}

export interface ICandidateListProps {
  candidates: Candidate[];
  loading?: boolean;
  error?: string;
  onSearch?: (term: string) => void;
  onFilter?: (filters: any) => void;
} 