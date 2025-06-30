// Interfaces base
export { IBaseRepository } from './IBaseRepository';

// Interfaces específicas de repositorios
export { ICandidateRepository, CandidateSearchCriteria, PaginatedCandidates } from './ICandidateRepository';
export { IPositionRepository, PositionStatus, PositionSearchCriteria } from './IPositionRepository';
export { IApplicationRepository, CandidateInfo, ApplicationSummary } from './IApplicationRepository';
export { 
    IInterviewRepository, 
    InterviewSearchCriteria, 
    InterviewStatistics, 
    InterviewSummary 
} from './IInterviewRepository';
export { ICompanyRepository } from './ICompanyRepository';
export { IInterviewFlowRepository } from './IInterviewFlowRepository';

// Re-exportar tipos útiles
export type RepositoryId = number;
export type RepositoryEntity = any; // Será reemplazado por tipos específicos del dominio 