import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { positionService } from '../services/positionService';

const EditPositionForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'Draft',
        isVisible: false,
        location: '',
        jobDescription: '',
        requirements: '',
        responsibilities: '',
        salaryMin: '',
        salaryMax: '',
        employmentType: '',
        benefits: '',
        companyDescription: '',
        applicationDeadline: '',
        contactInfo: ''
    });
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        const fetchPosition = async () => {
            try {
                setFetching(true);
                const position = await positionService.getPositionById(parseInt(id));
                
                // Format applicationDeadline for input
                let formattedDeadline = '';
                if (position.applicationDeadline) {
                    const date = new Date(position.applicationDeadline);
                    formattedDeadline = date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
                }

                setFormData({
                    title: position.title || '',
                    description: position.description || '',
                    status: position.status || 'Draft',
                    isVisible: position.isVisible || false,
                    location: position.location || '',
                    jobDescription: position.jobDescription || '',
                    requirements: position.requirements || '',
                    responsibilities: position.responsibilities || '',
                    salaryMin: position.salaryMin || '',
                    salaryMax: position.salaryMax || '',
                    employmentType: position.employmentType || '',
                    benefits: position.benefits || '',
                    companyDescription: position.companyDescription || '',
                    applicationDeadline: formattedDeadline,
                    contactInfo: position.contactInfo || ''
                });
            } catch (error) {
                console.error('Error fetching position:', error);
                setError('Error loading position data. Please try again.');
            } finally {
                setFetching(false);
            }
        };

        if (id) {
            fetchPosition();
        }
    }, [id]);

    const validateForm = () => {
        const errors = {};

        if (!formData.title || formData.title.trim() === '') {
            errors.title = 'Title is required';
        } else if (formData.title.length > 100) {
            errors.title = 'Title must not exceed 100 characters';
        }

        if (!formData.description || formData.description.trim() === '') {
            errors.description = 'Description is required';
        }

        if (!formData.location || formData.location.trim() === '') {
            errors.location = 'Location is required';
        }

        if (!formData.jobDescription || formData.jobDescription.trim() === '') {
            errors.jobDescription = 'Job description is required';
        }

        const validStatuses = ['Draft', 'Open', 'Contratado', 'Cerrado', 'Borrador'];
        if (formData.status && !validStatuses.includes(formData.status)) {
            errors.status = 'Invalid status value';
        }

        if (formData.salaryMin !== '' && (isNaN(formData.salaryMin) || parseFloat(formData.salaryMin) < 0)) {
            errors.salaryMin = 'Salary minimum must be a number >= 0';
        }

        if (formData.salaryMax !== '' && (isNaN(formData.salaryMax) || parseFloat(formData.salaryMax) < 0)) {
            errors.salaryMax = 'Salary maximum must be a number >= 0';
        }

        if (formData.salaryMin !== '' && formData.salaryMax !== '') {
            const min = parseFloat(formData.salaryMin);
            const max = parseFloat(formData.salaryMax);
            if (max < min) {
                errors.salaryMax = 'Salary maximum must be >= salary minimum';
            }
        }

        if (formData.applicationDeadline) {
            const deadline = new Date(formData.applicationDeadline);
            if (isNaN(deadline.getTime())) {
                errors.applicationDeadline = 'Invalid date format';
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            // Prepare update data (only include fields that have values or are being changed)
            const updateData = {};
            
            if (formData.title) updateData.title = formData.title;
            if (formData.description) updateData.description = formData.description;
            if (formData.status) updateData.status = formData.status;
            if (formData.isVisible !== undefined) updateData.isVisible = formData.isVisible;
            if (formData.location) updateData.location = formData.location;
            if (formData.jobDescription) updateData.jobDescription = formData.jobDescription;
            if (formData.requirements) updateData.requirements = formData.requirements;
            if (formData.responsibilities) updateData.responsibilities = formData.responsibilities;
            if (formData.salaryMin !== '') updateData.salaryMin = parseFloat(formData.salaryMin);
            if (formData.salaryMax !== '') updateData.salaryMax = parseFloat(formData.salaryMax);
            if (formData.employmentType) updateData.employmentType = formData.employmentType;
            if (formData.benefits) updateData.benefits = formData.benefits;
            if (formData.companyDescription) updateData.companyDescription = formData.companyDescription;
            if (formData.applicationDeadline) {
                // Convert to ISO 8601 format
                const date = new Date(formData.applicationDeadline);
                updateData.applicationDeadline = date.toISOString();
            }
            if (formData.contactInfo) updateData.contactInfo = formData.contactInfo;

            await positionService.updatePosition(parseInt(id), updateData);
            
            setSuccess(true);
            
            // Navigate back to positions list after 1.5 seconds
            setTimeout(() => {
                navigate('/positions');
            }, 1500);
        } catch (error) {
            console.error('Error updating position:', error);
            setError(error.message || 'Error updating position. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <Container className="mt-5">
                <div>Loading position data...</div>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <Button variant="link" onClick={() => navigate('/positions')} className="mb-3">
                ← Back to Positions
            </Button>
            <Card>
                <Card.Header>
                    <h2>Edit Position</h2>
                </Card.Header>
                <Card.Body>
                    {success && (
                        <Alert variant="success">
                            Position updated successfully! Redirecting to positions list...
                        </Alert>
                    )}
                    {error && (
                        <Alert variant="danger">
                            {error}
                        </Alert>
                    )}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Title *</Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                isInvalid={!!validationErrors.title}
                                maxLength={100}
                            />
                            <Form.Control.Feedback type="invalid">
                                {validationErrors.title}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                isInvalid={!!validationErrors.description}
                            />
                            <Form.Control.Feedback type="invalid">
                                {validationErrors.description}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Status *</Form.Label>
                            <Form.Select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                isInvalid={!!validationErrors.status}
                            >
                                <option value="Draft">Draft</option>
                                <option value="Open">Open</option>
                                <option value="Contratado">Contratado</option>
                                <option value="Cerrado">Cerrado</option>
                                <option value="Borrador">Borrador</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {validationErrors.status}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                name="isVisible"
                                label="Visible"
                                checked={formData.isVisible}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Location *</Form.Label>
                            <Form.Control
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                isInvalid={!!validationErrors.location}
                            />
                            <Form.Control.Feedback type="invalid">
                                {validationErrors.location}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Job Description *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                name="jobDescription"
                                value={formData.jobDescription}
                                onChange={handleChange}
                                isInvalid={!!validationErrors.jobDescription}
                            />
                            <Form.Control.Feedback type="invalid">
                                {validationErrors.jobDescription}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Requirements</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Responsibilities</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="responsibilities"
                                value={formData.responsibilities}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Salary Minimum</Form.Label>
                            <Form.Control
                                type="number"
                                name="salaryMin"
                                value={formData.salaryMin}
                                onChange={handleChange}
                                min="0"
                                isInvalid={!!validationErrors.salaryMin}
                            />
                            <Form.Control.Feedback type="invalid">
                                {validationErrors.salaryMin}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Salary Maximum</Form.Label>
                            <Form.Control
                                type="number"
                                name="salaryMax"
                                value={formData.salaryMax}
                                onChange={handleChange}
                                min="0"
                                isInvalid={!!validationErrors.salaryMax}
                            />
                            <Form.Control.Feedback type="invalid">
                                {validationErrors.salaryMax}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Employment Type</Form.Label>
                            <Form.Control
                                type="text"
                                name="employmentType"
                                value={formData.employmentType}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Benefits</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="benefits"
                                value={formData.benefits}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Company Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="companyDescription"
                                value={formData.companyDescription}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Application Deadline</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                name="applicationDeadline"
                                value={formData.applicationDeadline}
                                onChange={handleChange}
                                isInvalid={!!validationErrors.applicationDeadline}
                            />
                            <Form.Control.Feedback type="invalid">
                                {validationErrors.applicationDeadline}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Contact Info</Form.Label>
                            <Form.Control
                                type="text"
                                name="contactInfo"
                                value={formData.contactInfo}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-between">
                            <Button variant="secondary" onClick={() => navigate('/positions')}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Position'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default EditPositionForm;
