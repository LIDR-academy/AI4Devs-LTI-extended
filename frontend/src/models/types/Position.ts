import { PositionStatus } from '../enums/PositionStatus';

export type Position = {
  id: number;
  title: string;
  contactInfo: string;
  applicationDeadline: string;
  status: PositionStatus;
  description?: string;
  requirements?: string[];
  company?: string;
  location?: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  createdAt?: string;
  updatedAt?: string;
}; 