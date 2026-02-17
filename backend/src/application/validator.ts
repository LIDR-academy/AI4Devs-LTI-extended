const NAME_REGEX = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]+$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^(6|7|9)\d{8}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

//Length validations according to the database schema

const validateName = (name: string) => {
    if (!name || name.length < 2 || name.length > 100 || !NAME_REGEX.test(name)) {
        throw new Error('Invalid name');
    }
};

const validateEmail = (email: string) => {
    if (!email || !EMAIL_REGEX.test(email)) {
        throw new Error('Invalid email');
    }
};

const validatePhone = (phone: string) => {
    if (phone && !PHONE_REGEX.test(phone)) {
        throw new Error('Invalid phone');
    }
};

const validateDate = (date: string) => {
    if (!date || !DATE_REGEX.test(date)) {
        throw new Error('Invalid date');
    }
};

const validateAddress = (address: string) => {
    if (address && address.length > 100) {
        throw new Error('Invalid address');
    }
};

const validateEducation = (education: any) => {
    if (!education.institution || education.institution.length > 100) {
        throw new Error('Invalid institution');
    }

    if (!education.title || education.title.length > 100) {
        throw new Error('Invalid title');
    }

    validateDate(education.startDate);

    if (education.endDate && !DATE_REGEX.test(education.endDate)) {
        throw new Error('Invalid end date');
    }
};

const validateExperience = (experience: any) => {
    if (!experience.company || experience.company.length > 100) {
        throw new Error('Invalid company');
    }

    if (!experience.position || experience.position.length > 100) {
        throw new Error('Invalid position');
    }

    if (experience.description && experience.description.length > 200) {
        throw new Error('Invalid description');
    }

    validateDate(experience.startDate);

    if (experience.endDate && !DATE_REGEX.test(experience.endDate)) {
        throw new Error('Invalid end date');
    }
};

const validateCV = (cv: any) => {
    if (typeof cv !== 'object' || !cv.filePath || typeof cv.filePath !== 'string' || !cv.fileType || typeof cv.fileType !== 'string') {
        throw new Error('Invalid CV data');
    }
};

export const validateCandidateData = (data: any) => {
    if (data.id) {
        // If id is provided, we are editing an existing candidate, so fields are not mandatory
        return;
    }

    validateName(data.firstName);
    validateName(data.lastName);
    validateEmail(data.email);
    validatePhone(data.phone);
    validateAddress(data.address);

    if (data.educations) {
        // Ensure the maximum number of educations does not exceed 3
        if (data.educations.length > 3) {
            throw new Error("A candidate cannot have more than 3 educations");
        }
        for (const education of data.educations) {
            validateEducation(education);
        }
    }

    if (data.workExperiences) {
        for (const experience of data.workExperiences) {
            validateExperience(experience);
        }
    }

    if (data.cv && Object.keys(data.cv).length > 0) {
        validateCV(data.cv);
    }
};

// ISO 8601 date-time (must include time part, e.g. 2026-02-15T10:00:00Z or 2026-02-15T00:00:00.000Z). Date-only (2026-02-15) is rejected.
const isValidISO8601DateTime = (value: string): boolean => {
    if (typeof value !== 'string' || !value.trim()) return false;
    if (!value.includes('T')) return false;
    const parsed = Date.parse(value);
    return !Number.isNaN(parsed);
};

const REQUIRED_INTEGER_MSG = (field: string) => `${field} is required and must be an integer`;

export const validateInterviewData = (_candidateId: number, data: any): void => {
    if (data.applicationId == null || typeof data.applicationId !== 'number' || !Number.isInteger(data.applicationId)) {
        throw new Error(REQUIRED_INTEGER_MSG('applicationId'));
    }
    if (data.interviewStepId == null || typeof data.interviewStepId !== 'number' || !Number.isInteger(data.interviewStepId)) {
        throw new Error(REQUIRED_INTEGER_MSG('interviewStepId'));
    }
    if (data.employeeId == null || typeof data.employeeId !== 'number' || !Number.isInteger(data.employeeId)) {
        throw new Error(REQUIRED_INTEGER_MSG('employeeId'));
    }
    if (typeof data.interviewDate !== 'string') {
        throw new Error('interviewDate is required and must be a string');
    }
    if (!isValidISO8601DateTime(data.interviewDate)) {
        throw new Error('interviewDate must be a valid ISO 8601 date-time format');
    }
    if (data.score != null && data.score !== undefined) {
        if (typeof data.score !== 'number' || !Number.isInteger(data.score) || data.score < 0 || data.score > 5) {
            throw new Error('Score must be between 0 and 5');
        }
    }
    if (data.notes != null && data.notes !== undefined) {
        if (typeof data.notes !== 'string') throw new Error('notes must be a string');
        if (data.notes.length > 1000) throw new Error('Notes must not exceed 1000 characters');
    }
};

const POSITION_STATUS_VALUES = ['Draft', 'Open', 'Contratado', 'Cerrado', 'Borrador'];

export const validatePositionUpdateData = (data: any): void => {
    if (data.id !== undefined) throw new Error('id cannot be updated');
    if (data.companyId !== undefined) throw new Error('companyId cannot be updated');
    if (data.interviewFlowId !== undefined) throw new Error('interviewFlowId cannot be updated');
    if (data.title !== undefined) {
        if (typeof data.title !== 'string') throw new Error('title must be a string');
        if (data.title.length === 0 || data.title.length > 100) throw new Error('Invalid title');
    }
    if (data.description !== undefined) {
        if (typeof data.description !== 'string') throw new Error('description must be a string');
        if (data.description.length === 0) throw new Error('Invalid description');
    }
    if (data.location !== undefined) {
        if (typeof data.location !== 'string') throw new Error('location must be a string');
        if (data.location.length === 0) throw new Error('Invalid location');
    }
    if (data.jobDescription !== undefined) {
        if (typeof data.jobDescription !== 'string') throw new Error('jobDescription must be a string');
        if (data.jobDescription.length === 0) throw new Error('Invalid jobDescription');
    }
    if (data.status !== undefined) {
        if (typeof data.status !== 'string') throw new Error('status must be a string');
        if (!POSITION_STATUS_VALUES.includes(data.status)) throw new Error('Invalid status');
    }
    if (data.isVisible !== undefined) {
        if (typeof data.isVisible !== 'boolean') throw new Error('isVisible must be a boolean');
    }
    if (data.salaryMin !== undefined) {
        if (typeof data.salaryMin !== 'number') throw new Error('salaryMin must be a number');
        if (data.salaryMin < 0) throw new Error('salaryMin cannot be negative');
    }
    if (data.salaryMax !== undefined) {
        if (typeof data.salaryMax !== 'number') throw new Error('salaryMax must be a number');
        if (data.salaryMax < 0) throw new Error('salaryMax cannot be negative');
    }
    if (data.salaryMin !== undefined && data.salaryMax !== undefined && data.salaryMax < data.salaryMin) {
        throw new Error('salaryMax must be greater than or equal to salaryMin');
    }
    if (data.applicationDeadline !== undefined) {
        if (typeof data.applicationDeadline !== 'string') throw new Error('applicationDeadline must be a string');
        if (!isValidISO8601DateTime(data.applicationDeadline)) throw new Error('applicationDeadline must be valid ISO 8601');
    }
};

const INTERVIEW_RESULT_VALUES = ['Pending', 'Passed', 'Failed'];

export const validateInterviewUpdateData = (data: any): void => {
    if (data.interviewStepId !== undefined) {
        if (typeof data.interviewStepId !== 'number' || !Number.isInteger(data.interviewStepId)) {
            throw new Error('interviewStepId must be an integer');
        }
    }
    if (data.employeeId !== undefined) {
        if (typeof data.employeeId !== 'number' || !Number.isInteger(data.employeeId)) {
            throw new Error('employeeId must be an integer');
        }
    }
    if (data.interviewDate !== undefined) {
        if (typeof data.interviewDate !== 'string') throw new Error('interviewDate must be a string');
        if (!isValidISO8601DateTime(data.interviewDate)) throw new Error('interviewDate must be valid ISO 8601');
    }
    if (data.score !== undefined && data.score !== null) {
        if (typeof data.score !== 'number' || !Number.isInteger(data.score) || data.score < 0 || data.score > 5) {
            throw new Error('Score must be between 0 and 5');
        }
    }
    if (data.notes !== undefined && data.notes !== null) {
        if (typeof data.notes !== 'string') throw new Error('notes must be a string');
        if (data.notes.length > 1000) throw new Error('Notes must not exceed 1000 characters');
    }
    if (data.result !== undefined && data.result !== null) {
        if (typeof data.result !== 'string') throw new Error('result must be a string');
        if (!INTERVIEW_RESULT_VALUES.includes(data.result)) throw new Error('Invalid result value');
    }
};

export const validateInterviewDeletion = (candidateId: any, interviewId: any, deletionData: any): void => {
    if (typeof candidateId !== 'number' || !Number.isInteger(candidateId)) {
        throw new Error('candidateId must be a valid integer');
    }
    if (typeof interviewId !== 'number' || !Number.isInteger(interviewId)) {
        throw new Error('interviewId must be a valid integer');
    }
    if (deletionData?.reason == null || deletionData?.reason === undefined) {
        throw new Error('reason is required');
    }
    if (typeof deletionData.reason !== 'string') {
        throw new Error('reason must be a string');
    }
    if (deletionData.reason.trim().length === 0) {
        throw new Error('reason cannot be empty');
    }
    if (deletionData.reason.length > 500) {
        throw new Error('reason must not exceed 500 characters');
    }
};