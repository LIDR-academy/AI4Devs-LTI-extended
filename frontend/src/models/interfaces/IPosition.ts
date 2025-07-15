import { Position } from '../types/Position';

export interface IPositionProps {
  position: Position;
  onEdit?: (position: Position) => void;
  onDelete?: (id: number) => void;
  onView?: (id: number) => void;
}

export interface IPositionListProps {
  positions: Position[];
  loading?: boolean;
  error?: string;
  onSearch?: (term: string) => void;
  onFilter?: (filters: any) => void;
} 