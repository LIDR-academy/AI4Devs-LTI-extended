import { CandidateStatus } from '../enums/CandidateStatus';

export type Candidate = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  applications?: Array<{
    id: number;
    positionId: number;
    applicationDate: string;
    currentInterviewStep: number;
    notes?: string;
    position?: {
      id: number;
      title: string;
    };
  }>;
  status?: CandidateStatus;
  createdAt?: string;
  updatedAt?: string;
}; 