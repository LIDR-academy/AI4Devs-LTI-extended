export enum CandidateStatus {
  NEW = 0,
  IN_REVIEW = 1,
  INTERVIEWING = 2,
  HIRED = 3,
  REJECTED = 4
}

export const getCandidateStatusName = (status: CandidateStatus): string => {
  switch (status) {
    case CandidateStatus.NEW:
      return 'Nuevo';
    case CandidateStatus.IN_REVIEW:
      return 'En revisión';
    case CandidateStatus.INTERVIEWING:
      return 'En entrevista';
    case CandidateStatus.HIRED:
      return 'Contratado';
    case CandidateStatus.REJECTED:
      return 'Rechazado';
    default:
      return 'Desconocido';
  }
};

export const getCandidateStatusBadgeColor = (status: CandidateStatus): string => {
  switch (status) {
    case CandidateStatus.NEW:
      return 'bg-secondary';
    case CandidateStatus.IN_REVIEW:
      return 'bg-info';
    case CandidateStatus.INTERVIEWING:
      return 'bg-warning';
    case CandidateStatus.HIRED:
      return 'bg-success';
    case CandidateStatus.REJECTED:
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
}; 