import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { positionService } from '../services/positionService';
import BackButton from './BackButton';

const EditPosition = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [position, setPosition] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'Borrador',
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

    useEffect(() => {
        const fetchPosition = async () => {
            try {
                setLoading(true);
                const positionData = await positionService.getPositionById(id);
                setPosition(positionData);
                
                // Format date for input field
                const formattedDeadline = positionData.applicationDeadline 
                    ? new Date(positionData.applicationDeadline).toISOString().split('T')[0]
                    : '';
                
                setFormData({
                    title: positionData.title || '',
                    description: positionData.description || '',
                    status: positionData.status || 'Borrador',
                    location: positionData.location || '',
                    jobDescription: positionData.jobDescription || '',
                    requirements: positionData.requirements || '',
                    responsibilities: positionData.responsibilities || '',
                    salaryMin: positionData.salaryMin || '',
                    salaryMax: positionData.salaryMax || '',
                    employmentType: positionData.employmentType || '',
                    benefits: positionData.benefits || '',
                    companyDescription: positionData.companyDescription || '',
                    applicationDeadline: formattedDeadline,
                    contactInfo: positionData.contactInfo || ''
                });
            } catch (error) {
                setError('Error al cargar la posición: ' + error.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPosition();
        }
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            // Prepare data for API
            const updateData = { ...formData };
            
            // Convert salary fields to numbers if they have values
            if (updateData.salaryMin && updateData.salaryMin !== '') {
                updateData.salaryMin = parseInt(updateData.salaryMin);
            } else {
                updateData.salaryMin = null;
            }
            
            if (updateData.salaryMax && updateData.salaryMax !== '') {
                updateData.salaryMax = parseInt(updateData.salaryMax);
            } else {
                updateData.salaryMax = null;
            }

            // Convert date field
            if (updateData.applicationDeadline && updateData.applicationDeadline !== '') {
                updateData.applicationDeadline = new Date(updateData.applicationDeadline).toISOString();
            } else {
                updateData.applicationDeadline = null;
            }

            // Required fields - don't convert to null if empty, just keep as string
            // The backend validation requires these to be non-empty strings if provided
            const requiredFields = ['title', 'description', 'location', 'jobDescription'];
            
            // Optional fields - convert empty strings to null
            const optionalFields = ['requirements', 'responsibilities', 'benefits', 'companyDescription', 'contactInfo', 'employmentType'];
            
            optionalFields.forEach(field => {
                if (updateData[field] === '') {
                    updateData[field] = null;
                }
            });

            // Remove fields that are empty strings for required fields to avoid validation errors
            // Only send fields that have actual values
            const finalUpdateData = {};
            Object.keys(updateData).forEach(key => {
                if (requiredFields.includes(key)) {
                    // Only include required fields if they have actual content
                    if (updateData[key] && updateData[key].trim() !== '') {
                        finalUpdateData[key] = updateData[key];
                    }
                } else {
                    // Include all other fields (optional fields, status, etc.)
                    finalUpdateData[key] = updateData[key];
                }
            });

            console.log('Sending update data to backend:', finalUpdateData);
            await positionService.updatePosition(id, finalUpdateData);
            setSuccess('Posición actualizada exitosamente');
            
            // Navigate back to positions page after a short delay
            setTimeout(() => {
                navigate('/positions');
            }, 2000);
            
        } catch (error) {
            console.error('Full error object:', error);
            console.error('Error response:', error.response?.data);
            
            let errorMessage = 'Error desconocido';
            
            if (error.response && error.response.data) {
                // Backend validation error
                errorMessage = error.response.data.error || error.response.data.message || errorMessage;
                console.error('Backend error:', errorMessage);
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setError('Error al actualizar la posición: ' + errorMessage);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </Spinner>
                <p>Cargando posición...</p>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <BackButton to="/positions" />
            
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card>
                        <Card.Header>
                            <h3>Editar Posición</h3>
                        </Card.Header>
                        <Card.Body>
                            {error && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert variant="success">{success}</Alert>}
                            
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Título *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Estado</Form.Label>
                                            <Form.Select
                                                name="status"
                                                value={formData.status}
                                                onChange={handleInputChange}
                                            >
                                                <option value="Borrador">Borrador</option>
                                                <option value="Open">Abierto</option>
                                                <option value="Cerrado">Cerrado</option>
                                                <option value="Contratado">Contratado</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Descripción</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Ubicación</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Tipo de Empleo</Form.Label>
                                            <Form.Select
                                                name="employmentType"
                                                value={formData.employmentType}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Seleccionar...</option>
                                                <option value="Full-time">Tiempo Completo</option>
                                                <option value="Part-time">Medio Tiempo</option>
                                                <option value="Contract">Contrato</option>
                                                <option value="Temporary">Temporal</option>
                                                <option value="Internship">Prácticas</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Descripción del Trabajo</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        name="jobDescription"
                                        value={formData.jobDescription}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Requisitos</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="requirements"
                                        value={formData.requirements}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Responsabilidades</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="responsibilities"
                                        value={formData.responsibilities}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Salario Mínimo</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="salaryMin"
                                                value={formData.salaryMin}
                                                onChange={handleInputChange}
                                                min="0"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Salario Máximo</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="salaryMax"
                                                value={formData.salaryMax}
                                                onChange={handleInputChange}
                                                min="0"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Beneficios</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="benefits"
                                        value={formData.benefits}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Descripción de la Empresa</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="companyDescription"
                                        value={formData.companyDescription}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Fecha Límite de Aplicación</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="applicationDeadline"
                                                value={formData.applicationDeadline}
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Información de Contacto</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="contactInfo"
                                                value={formData.contactInfo}
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="d-flex justify-content-between">
                                    <Button 
                                        variant="secondary" 
                                        onClick={() => navigate('/positions')}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button 
                                        variant="primary" 
                                        type="submit" 
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                Guardando...
                                            </>
                                        ) : (
                                            'Guardar Cambios'
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default EditPosition; 