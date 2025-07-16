import React, { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { getCandidates } from '../services/candidateService';
import { Candidate } from '../models/types/Candidate';

const Candidates: React.FC = () => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Fetch candidates from the API
    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                setLoading(true);
                const response = await getCandidates();
                setCandidates(response.data || response);
            } catch (error) {
                setError('Error al cargar candidatos');
                console.error('Failed to fetch candidates', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCandidates();
    }, []);

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const filteredCandidates = candidates.filter(candidate =>
        candidate.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </Spinner>
                <p className="mt-2">Cargando candidatos...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                    <Button variant="outline-danger" onClick={() => window.location.reload()}>
                        Reintentar
                    </Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <Button variant="link" onClick={() => navigate('/')} className="mb-3">
                Volver al Dashboard
            </Button>
            <h2 className="text-center mb-4">Candidatos</h2>
            
            <Row className="mb-4">
                <Col md={3}>
                    <Form.Control 
                        type="text" 
                        placeholder="Buscar por nombre o email" 
                        value={searchTerm}
                        onChange={handleSearch}
                        aria-label="Buscar candidatos por nombre o email"
                    />
                </Col>
                <Col md={3}>
                    <Form.Control type="date" placeholder="Buscar por fecha" />
                </Col>
                <Col md={3}>
                    <Form.Control as="select">
                        <option value="">Estado</option>
                        <option value="new">Nuevo</option>
                        <option value="interviewing">En entrevista</option>
                        <option value="hired">Contratado</option>
                        <option value="rejected">Rechazado</option>
                    </Form.Control>
                </Col>
                <Col md={3}>
                    <Form.Control as="select">
                        <option value="">Posición</option>
                        <option value="developer">Desarrollador</option>
                        <option value="designer">Diseñador</option>
                        <option value="manager">Manager</option>
                    </Form.Control>
                </Col>
            </Row>
            
            <Row>
                {filteredCandidates.map((candidate, index) => (
                    <Col md={4} key={index} className="mb-4">
                        <Card className="shadow-sm">
                            <Card.Body>
                                <Card.Title>{candidate.firstName} {candidate.lastName}</Card.Title>
                                <Card.Text>
                                    <strong>Email:</strong> {candidate.email}<br />
                                    {candidate.phone && <><strong>Teléfono:</strong> {candidate.phone}<br /></>}
                                    {candidate.applications && candidate.applications.length > 0 && (
                                        <><strong>Posiciones:</strong> {candidate.applications.length}<br /></>
                                    )}
                                </Card.Text>
                                <div className="d-flex justify-content-between mt-3">
                                    <Button variant="primary" onClick={() => navigate(`/candidates/${candidate.id}`)}>
                                        Ver detalles
                                    </Button>
                                    <Button variant="secondary" onClick={() => navigate(`/candidates/${candidate.id}/edit`)}>
                                        Editar
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default Candidates; 