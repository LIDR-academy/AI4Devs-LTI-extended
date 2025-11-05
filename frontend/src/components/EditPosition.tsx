import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { positionService } from '../services/positionService';

type PositionStatus = 'Open' | 'Contratado' | 'Cerrado' | 'Borrador';

interface Position {
  id: number;
  companyId?: number;
  interviewFlowId?: number;
  title: string;
  description: string;
  status: PositionStatus;
  isVisible?: boolean;
  location: string;
  jobDescription: string;
  requirements?: string;
  responsibilities?: string;
  salaryMin?: number;
  salaryMax?: number;
  employmentType?: string;
  benefits?: string;
  companyDescription?: string;
  applicationDeadline?: string;
  contactInfo?: string;
}

interface PositionFormData {
  title: string;
  description: string;
  status: PositionStatus;
  isVisible: boolean;
  location: string;
  jobDescription: string;
  requirements: string;
  responsibilities: string;
  salaryMin: string;
  salaryMax: string;
  employmentType: string;
  benefits: string;
  companyDescription: string;
  applicationDeadline: string;
  contactInfo: string;
  companyId: string;
  interviewFlowId: string;
}

const EditPosition: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [position, setPosition] = useState<Position | null>(null);
  const [formData, setFormData] = useState<PositionFormData>({
    title: '',
    description: '',
    status: 'Borrador',
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
    contactInfo: '',
    companyId: '',
    interviewFlowId: ''
  });
  
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    const fetchPosition = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError('');
        const data = await positionService.getPositionById(id);
        setPosition(data);
        
        // Format date for input field (YYYY-MM-DD)
        const deadline = data.applicationDeadline 
          ? new Date(data.applicationDeadline).toISOString().split('T')[0]
          : '';
        
        setFormData({
          title: data.title || '',
          description: data.description || '',
          status: data.status || 'Borrador',
          isVisible: data.isVisible ?? false,
          location: data.location || '',
          jobDescription: data.jobDescription || '',
          requirements: data.requirements || '',
          responsibilities: data.responsibilities || '',
          salaryMin: data.salaryMin?.toString() || '',
          salaryMax: data.salaryMax?.toString() || '',
          employmentType: data.employmentType || '',
          benefits: data.benefits || '',
          companyDescription: data.companyDescription || '',
          applicationDeadline: deadline,
          contactInfo: data.contactInfo || '',
          companyId: data.companyId?.toString() || '',
          interviewFlowId: data.interviewFlowId?.toString() || ''
        });
      } catch (err: any) {
        console.error('Error fetching position:', err);
        if (err.response?.status === 404) {
          setError('Position not found. Please check the position ID.');
        } else {
          setError('An error occurred while loading the position. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosition();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const transformFormData = (): Partial<Position> => {
    const transformed: any = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      jobDescription: formData.jobDescription.trim(),
      status: formData.status,
      isVisible: formData.isVisible
    };

    // Add optional fields only if they have values
    if (formData.requirements.trim()) transformed.requirements = formData.requirements.trim();
    if (formData.responsibilities.trim()) transformed.responsibilities = formData.responsibilities.trim();
    if (formData.employmentType.trim()) transformed.employmentType = formData.employmentType.trim();
    if (formData.benefits.trim()) transformed.benefits = formData.benefits.trim();
    if (formData.companyDescription.trim()) transformed.companyDescription = formData.companyDescription.trim();
    if (formData.contactInfo.trim()) transformed.contactInfo = formData.contactInfo.trim();

    // Convert salary fields to numbers
    if (formData.salaryMin.trim()) {
      const min = parseInt(formData.salaryMin.trim(), 10);
      if (!isNaN(min) && min >= 0) transformed.salaryMin = min;
    }
    if (formData.salaryMax.trim()) {
      const max = parseInt(formData.salaryMax.trim(), 10);
      if (!isNaN(max) && max >= 0) transformed.salaryMax = max;
    }

    // Convert date to ISO string format
    if (formData.applicationDeadline) {
      const date = new Date(formData.applicationDeadline);
      if (!isNaN(date.getTime())) {
        transformed.applicationDeadline = date.toISOString();
      }
    }

    // Convert companyId and interviewFlowId to numbers if provided
    if (formData.companyId.trim()) {
      const companyId = parseInt(formData.companyId.trim(), 10);
      if (!isNaN(companyId) && companyId > 0) transformed.companyId = companyId;
    }
    if (formData.interviewFlowId.trim()) {
      const interviewFlowId = parseInt(formData.interviewFlowId.trim(), 10);
      if (!isNaN(interviewFlowId) && interviewFlowId > 0) transformed.interviewFlowId = interviewFlowId;
    }

    return transformed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const transformedData = transformFormData();
      await positionService.updatePosition(id, transformedData);
      
      setSuccess('Position updated successfully!');
      
      // Navigate to positions list after 2 seconds
      setTimeout(() => {
        navigate('/positions');
      }, 2000);
    } catch (err: any) {
      console.error('Error updating position:', err);
      
      if (err.response?.status === 400) {
        // Backend validation error (Spanish message)
        const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Validation error occurred.';
        setError(errorMessage);
      } else if (err.response?.status === 404) {
        setError('Position not found. Please check the position ID.');
      } else if (err.response?.status === 500) {
        setError('An error occurred while updating the position. Please try again later.');
      } else {
        setError('Unable to connect to the server. Please check your connection.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/positions');
  };

  if (loading) {
    return (
      <Container className="mt-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (error && !position) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate('/positions')}>
          Back to Positions
        </Button>
      </Container>
    );
  }

  return (
    <Container className="mt-5" style={{ maxWidth: '1320px' }}>
      <Row className="mb-3">
        <Col>
          <Button 
            variant="link" 
            onClick={() => navigate('/positions')}
            className="p-0"
            style={{ textDecoration: 'none' }}
            data-testid="back-to-positions"
          >
            ← Volver a Posiciones
          </Button>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col>
          <Card className="shadow-sm">
            <Card.Header style={{ backgroundColor: 'rgba(33, 37, 41, 0.03)', borderBottom: '1px solid rgba(0, 0, 0, 0.18)' }}>
              <Card.Title as="h3" className="mb-0" style={{ fontSize: '27.6px', fontWeight: 600 }}>
                Editar Posición
              </Card.Title>
            </Card.Header>
            <Card.Body style={{ padding: '16px' }}>
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert variant="success" dismissible onClose={() => setSuccess('')}>
                  {success}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>
                        Título <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        maxLength={100}
                        data-testid="position-title-input"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Estado</Form.Label>
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        data-testid="position-status-select"
                      >
                        <option value="Borrador">Borrador</option>
                        <option value="Open">Abierto</option>
                        <option value="Contratado">Contratado</option>
                        <option value="Cerrado">Cerrado</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col className="mb-3">
                    <Form.Group>
                      <Form.Label>Descripción</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        data-testid="position-description-input"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>
                        Ubicación <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                        data-testid="position-location-input"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Tipo de Empleo</Form.Label>
                      <Form.Select
                        name="employmentType"
                        value={formData.employmentType}
                        onChange={handleInputChange}
                        data-testid="position-employment-type-select"
                      >
                        <option value="">Seleccionar tipo</option>
                        <option value="Tiempo Completo">Tiempo Completo</option>
                        <option value="Medio Tiempo">Medio Tiempo</option>
                        <option value="Por Contrato">Por Contrato</option>
                        <option value="Freelance">Freelance</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col className="mb-3">
                    <Form.Group>
                      <Form.Label>
                        Descripción del Trabajo <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="jobDescription"
                        value={formData.jobDescription}
                        onChange={handleInputChange}
                        required
                        data-testid="position-job-description-input"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col className="mb-3">
                    <Form.Group>
                      <Form.Label>Requisitos</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleInputChange}
                        data-testid="position-requirements-input"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col className="mb-3">
                    <Form.Group>
                      <Form.Label>Responsabilidades</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="responsibilities"
                        value={formData.responsibilities}
                        onChange={handleInputChange}
                        data-testid="position-responsibilities-input"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Salario Mínimo</Form.Label>
                      <Form.Control
                        type="number"
                        name="salaryMin"
                        value={formData.salaryMin}
                        onChange={handleInputChange}
                        min="0"
                        data-testid="position-salary-min-input"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Salario Máximo</Form.Label>
                      <Form.Control
                        type="number"
                        name="salaryMax"
                        value={formData.salaryMax}
                        onChange={handleInputChange}
                        min="0"
                        data-testid="position-salary-max-input"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col className="mb-3">
                    <Form.Group>
                      <Form.Label>Beneficios</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="benefits"
                        value={formData.benefits}
                        onChange={handleInputChange}
                        data-testid="position-benefits-input"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col className="mb-3">
                    <Form.Group>
                      <Form.Label>Descripción de la Empresa</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="companyDescription"
                        value={formData.companyDescription}
                        onChange={handleInputChange}
                        data-testid="position-company-description-input"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Fecha Límite de Aplicación</Form.Label>
                      <Form.Control
                        type="date"
                        name="applicationDeadline"
                        value={formData.applicationDeadline}
                        onChange={handleInputChange}
                        data-testid="position-deadline-input"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Información de Contacto</Form.Label>
                      <Form.Control
                        type="text"
                        name="contactInfo"
                        value={formData.contactInfo}
                        onChange={handleInputChange}
                        data-testid="position-contact-info-input"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Company ID</Form.Label>
                      <Form.Control
                        type="number"
                        name="companyId"
                        value={formData.companyId}
                        onChange={handleInputChange}
                        min="1"
                        data-testid="position-company-id-input"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Interview Flow ID</Form.Label>
                      <Form.Control
                        type="number"
                        name="interviewFlowId"
                        value={formData.interviewFlowId}
                        onChange={handleInputChange}
                        min="1"
                        data-testid="position-interview-flow-id-input"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col className="mb-3">
                    <Form.Group>
                      <Form.Check
                        type="checkbox"
                        name="isVisible"
                        label="Visible públicamente"
                        checked={formData.isVisible}
                        onChange={handleInputChange}
                        data-testid="position-is-visible-checkbox"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mt-4">
                  <Col className="d-flex justify-content-between">
                    <Button
                      variant="secondary"
                      onClick={handleCancel}
                      disabled={saving}
                      data-testid="cancel-button"
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={saving}
                      data-testid="save-button"
                    >
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EditPosition;
