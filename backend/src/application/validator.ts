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
        if (typeof data.title !== 'string' || data.title.trim().length === 0) {
            throw new Error('El título es obligatorio y debe ser una cadena válida');
        }
        if (data.title.length > 100) {
            throw new Error('El título no puede exceder 100 caracteres');
        }
    }

    // Description validation
    if (data.description !== undefined) {
        if (typeof data.description !== 'string' || data.description.trim().length === 0) {
            throw new Error('La descripción es obligatoria y debe ser una cadena válida');
        }
    }

    // Location validation
    if (data.location !== undefined) {
        if (typeof data.location !== 'string' || data.location.trim().length === 0) {
            throw new Error('La ubicación es obligatoria y debe ser una cadena válida');
        }
    }

    // JobDescription validation
    if (data.jobDescription !== undefined) {
        if (typeof data.jobDescription !== 'string' || data.jobDescription.trim().length === 0) {
            throw new Error('La descripción del trabajo es obligatoria y debe ser una cadena válida');
        }
    }

    // Status validation
    if (data.status !== undefined) {
        const validStatuses = ['Open', 'Contratado', 'Cerrado', 'Borrador'];
        if (!validStatuses.includes(data.status)) {
            throw new Error('Estado inválido. Debe ser uno de: Open, Contratado, Cerrado, Borrador');
        }
    }

    // isVisible validation
    if (data.isVisible !== undefined) {
        if (typeof data.isVisible !== 'boolean') {
            throw new Error('isVisible debe ser un valor booleano');
        }
    }

    // companyId validation
    if (data.companyId !== undefined) {
        if (typeof data.companyId !== 'number' || !Number.isInteger(data.companyId) || data.companyId < 1) {
            throw new Error('companyId debe ser un número entero positivo');
        }
    }

    // interviewFlowId validation
    if (data.interviewFlowId !== undefined) {
        if (typeof data.interviewFlowId !== 'number' || !Number.isInteger(data.interviewFlowId) || data.interviewFlowId < 1) {
            throw new Error('interviewFlowId debe ser un número entero positivo');
        }
    }

    // salaryMin validation
    if (data.salaryMin !== undefined) {
        if (typeof data.salaryMin !== 'number' || isNaN(data.salaryMin) || data.salaryMin < 0) {
            throw new Error('El salario mínimo debe ser un número válido mayor o igual a 0');
        }
    }

    // salaryMax validation
    if (data.salaryMax !== undefined) {
        if (typeof data.salaryMax !== 'number' || isNaN(data.salaryMax) || data.salaryMax < 0) {
            throw new Error('El salario máximo debe ser un número válido mayor o igual a 0');
        }
    }

    // Salary range validation (both must be provided for this check)
    if (data.salaryMin !== undefined && data.salaryMax !== undefined) {
        if (data.salaryMin > data.salaryMax) {
            throw new Error('El salario mínimo no puede ser mayor que el máximo');
        }
    }

    // applicationDeadline validation
    if (data.applicationDeadline !== undefined) {
        const deadline = data.applicationDeadline instanceof Date 
            ? data.applicationDeadline 
            : new Date(data.applicationDeadline);
        
        if (isNaN(deadline.getTime())) {
            throw new Error('Fecha límite inválida');
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadlineDate = new Date(deadline);
        deadlineDate.setHours(0, 0, 0, 0);

        if (deadlineDate < today) {
            throw new Error('La fecha límite no puede ser anterior a hoy');
        }
    }

    // employmentType validation
    if (data.employmentType !== undefined) {
        if (typeof data.employmentType !== 'string' || data.employmentType.trim().length === 0) {
            throw new Error('El tipo de empleo debe ser una cadena válida');
        }
    }

    // Text fields validation (optional string fields)
    const textFields = ['requirements', 'responsibilities', 'benefits', 'companyDescription', 'contactInfo'];
    for (const field of textFields) {
        if (data[field] !== undefined && typeof data[field] !== 'string') {
            throw new Error(`${field} debe ser una cadena válida`);
        }
    }
};