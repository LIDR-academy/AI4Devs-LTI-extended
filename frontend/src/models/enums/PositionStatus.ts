export enum PositionStatus {
  OPEN = 'Open',
  HIRED = 'Contratado',
  CLOSED = 'Cerrado',
  DRAFT = 'Borrador'
}

export const getPositionStatusBadgeColor = (status: PositionStatus): string => {
  switch (status) {
    case PositionStatus.OPEN:
      return 'bg-warning';
    case PositionStatus.HIRED:
      return 'bg-success';
    case PositionStatus.DRAFT:
      return 'bg-secondary';
    case PositionStatus.CLOSED:
      return 'bg-warning';
    default:
      return 'bg-secondary';
  }
}; 