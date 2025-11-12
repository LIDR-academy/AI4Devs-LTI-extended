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

export const validatePositionUpdate = (data: any): void => {
    // Title validation
    if (data.title !== undefined) {
        if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
            throw new Error('Title is required and must be a valid string');
        }
        if (data.title.length > 100) {
            throw new Error('Title cannot exceed 100 characters');
        }
    }

    // Status validation
    if (data.status !== undefined) {
        const validStatuses = ['Open', 'Contratado', 'Cerrado', 'Borrador'];
        if (!validStatuses.includes(data.status)) {
            throw new Error('Invalid status. Must be one of: Open, Contratado, Cerrado, Borrador');
        }
    }

    // Salary validation
    if (data.salaryMin !== undefined) {
        if (typeof data.salaryMin !== 'number' || data.salaryMin < 0) {
            throw new Error('Minimum salary must be a valid number greater than or equal to 0');
        }
    }

    if (data.salaryMax !== undefined) {
        if (typeof data.salaryMax !== 'number' || data.salaryMax < 0) {
            throw new Error('Maximum salary must be a valid number greater than or equal to 0');
        }
    }

    // Salary range validation
    if (data.salaryMin !== undefined && data.salaryMax !== undefined) {
        if (data.salaryMin > data.salaryMax) {
            throw new Error('Minimum salary cannot be greater than maximum salary');
        }
    }

    // Application deadline validation
    if (data.applicationDeadline !== undefined) {
        const deadline = new Date(data.applicationDeadline);
        if (isNaN(deadline.getTime())) {
            throw new Error('Invalid application deadline');
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (deadline < today) {
            throw new Error('Application deadline cannot be in the past');
        }
    }

    // Boolean validation
    if (data.isVisible !== undefined && typeof data.isVisible !== 'boolean') {
        throw new Error('isVisible must be a boolean value');
    }

    // Integer validations
    if (data.companyId !== undefined) {
        if (!Number.isInteger(data.companyId) || data.companyId <= 0) {
            throw new Error('companyId must be a positive integer');
        }
    }

    if (data.interviewFlowId !== undefined) {
        if (!Number.isInteger(data.interviewFlowId) || data.interviewFlowId <= 0) {
            throw new Error('interviewFlowId must be a positive integer');
        }
    }

    // String field validations
    const stringFields = ['description', 'location', 'jobDescription', 'employmentType'];
    for (const field of stringFields) {
        if (data[field] !== undefined) {
            if (!data[field] || typeof data[field] !== 'string' || data[field].trim().length === 0) {
                throw new Error(`${field} is required and must be a valid string`);
            }
        }
    }

    // Optional string fields (can be empty but must be strings if provided)
    const optionalStringFields = ['requirements', 'responsibilities', 'benefits', 'companyDescription', 'contactInfo'];
    for (const field of optionalStringFields) {
        if (data[field] !== undefined && typeof data[field] !== 'string') {
            throw new Error(`${field} must be a string`);
        }
    }
};