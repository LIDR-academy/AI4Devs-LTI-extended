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

export const validatePositionUpdate = (positionData: any) => {
    // Validar título
    if (positionData.title !== undefined) {
        if (!positionData.title || typeof positionData.title !== 'string' || positionData.title.trim().length === 0) {
            throw new Error('El título es obligatorio y debe ser una cadena válida');
        }
        if (positionData.title.length > 100) {
            throw new Error('El título no puede exceder 100 caracteres');
        }
    }

    // Validar descripción
    if (positionData.description !== undefined) {
        if (!positionData.description || typeof positionData.description !== 'string' || positionData.description.trim().length === 0) {
            throw new Error('La descripción es obligatoria y debe ser una cadena válida');
        }
    }

    // Validar ubicación
    if (positionData.location !== undefined) {
        if (!positionData.location || typeof positionData.location !== 'string' || positionData.location.trim().length === 0) {
            throw new Error('La ubicación es obligatoria y debe ser una cadena válida');
        }
    }

    // Validar descripción del trabajo
    if (positionData.jobDescription !== undefined) {
        if (!positionData.jobDescription || typeof positionData.jobDescription !== 'string' || positionData.jobDescription.trim().length === 0) {
            throw new Error('La descripción del trabajo es obligatoria y debe ser una cadena válida');
        }
    }

    // Validar estado
    if (positionData.status !== undefined) {
        const validStatuses = ['Open', 'Contratado', 'Cerrado', 'Borrador'];
        if (!validStatuses.includes(positionData.status)) {
            throw new Error(`Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`);
        }
    }

    // Validar visibilidad
    if (positionData.isVisible !== undefined) {
        if (typeof positionData.isVisible !== 'boolean') {
            throw new Error('isVisible debe ser un valor booleano');
        }
    }

    // Validar IDs de referencia
    if (positionData.companyId !== undefined) {
        if (!Number.isInteger(positionData.companyId) || positionData.companyId <= 0) {
            throw new Error('companyId debe ser un número entero positivo');
        }
    }

    if (positionData.interviewFlowId !== undefined) {
        if (!Number.isInteger(positionData.interviewFlowId) || positionData.interviewFlowId <= 0) {
            throw new Error('interviewFlowId debe ser un número entero positivo');
        }
    }

    // Validar salarios
    if (positionData.salaryMin !== undefined && positionData.salaryMin !== null) {
        const salaryMin = parseFloat(positionData.salaryMin);
        if (isNaN(salaryMin) || salaryMin < 0) {
            throw new Error('El salario mínimo debe ser un número válido mayor o igual a 0');
        }
    }

    if (positionData.salaryMax !== undefined && positionData.salaryMax !== null) {
        const salaryMax = parseFloat(positionData.salaryMax);
        if (isNaN(salaryMax) || salaryMax < 0) {
            throw new Error('El salario máximo debe ser un número válido mayor o igual a 0');
        }
    }

    // Validar que salario mínimo no sea mayor que el máximo
    if (positionData.salaryMin !== undefined && positionData.salaryMax !== undefined && 
        positionData.salaryMin !== null && positionData.salaryMax !== null) {
        const salaryMin = parseFloat(positionData.salaryMin);
        const salaryMax = parseFloat(positionData.salaryMax);
        if (!isNaN(salaryMin) && !isNaN(salaryMax) && salaryMin > salaryMax) {
            throw new Error('El salario mínimo no puede ser mayor que el máximo');
        }
    }

    // Validar fecha límite de aplicación
    if (positionData.applicationDeadline !== undefined && positionData.applicationDeadline !== null) {
        const deadline = new Date(positionData.applicationDeadline);
        if (isNaN(deadline.getTime())) {
            throw new Error('Fecha límite inválida');
        }
        
        // Validar que la fecha límite no sea en el pasado
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
        if (deadline < today) {
            throw new Error('La fecha límite no puede ser anterior a hoy');
        }
    }

    // Validar tipo de empleo
    if (positionData.employmentType !== undefined && positionData.employmentType !== null) {
        if (typeof positionData.employmentType !== 'string' || positionData.employmentType.trim().length === 0) {
            throw new Error('El tipo de empleo debe ser una cadena válida');
        }
    }

    // Validar campos de texto opcionales
    const textFields = ['requirements', 'responsibilities', 'benefits', 'companyDescription', 'contactInfo'];
    textFields.forEach(field => {
        if (positionData[field] !== undefined && positionData[field] !== null) {
            if (typeof positionData[field] !== 'string') {
                throw new Error(`${field} debe ser una cadena de texto`);
            }
        }
    });
};