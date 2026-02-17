import React, { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Container, Row, Col, Form, Button } from 'react-bootstrap';
import axios from 'axios';

type Position = {
    id: number;
    title: string;
    contactInfo: string;
    applicationDeadline: string;
    status: 'Open' | 'Contratado' | 'Cerrado' | 'Borrador';
};

const Positions: React.FC = () => {
    const [positions, setPositions] = useState<Position[]>([]);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchPositions = async () => {
            try {
                const response = await axios.get('http://localhost:3010/positions');
                const formattedPositions = response.data.map((pos: Position) => ({
                    ...pos,
                    applicationDeadline: formatDate(pos.applicationDeadline)
                }));
                setPositions(formattedPositions);
            } catch (error) {
                console.error('Failed to fetch positions', error);
            }
        };

        fetchPositions();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const filteredPositions = positions.filter(position =>
        position.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container className="mt-5">
            <Button variant="link" onClick={() => navigate('/')} className="mb-3">
                Volver al Dashboard
            </Button>
            <h2 className="text-center mb-4">Posiciones</h2>
            <Row className="mb-4">
                <Col md={3}>
                    <Form.Control 
                        type="text" 
                        placeholder="Buscar por título" 
                        value={searchTerm}
                        onChange={handleSearch}
                        aria-label="Buscar posiciones por título"
                    />
                </Col>
                <Col md={3}>
                    <Form.Control type="date" placeholder="Buscar por fecha" />
                </Col>
                <Col md={3}>
                    <Form.Control as="select">
                        <option value="">Estado</option>
                        <option value="open">Abierto</option>
                        <option value="filled">Contratado</option>
                        <option value="closed">Cerrado</option>
                        <option value="draft">Borrador</option>
                    </Form.Control>
                </Col>
                <Col md={3}>
                    <Form.Control as="select">
                        <option value="">Manager</option>
                        <option value="john_doe">John Doe</option>
                        <option value="jane_smith">Jane Smith</option>
                        <option value="alex_jones">Alex Jones</option>
                    </Form.Control>
                </Col>
            </Row>
            <Row>
                {filteredPositions.map((position, index) => (
                    <Col md={4} key={index} className="mb-4">
                        <Card className="shadow-sm">
                            <Card.Body>
                                <Card.Title>{position.title}</Card.Title>
                                <Card.Text>
                                    <strong>Manager:</strong> {position.contactInfo}<br />
                                    <strong>Deadline:</strong> {position.applicationDeadline}
                                </Card.Text>
                                <span className={`badge ${position.status === 'Open' ? 'bg-warning' : position.status === 'Contratado' ? 'bg-success' : position.status === 'Borrador' ? 'bg-secondary' : 'bg-warning'} text-white`}>
                                    {position.status}
                                </span>
                                <div className="d-flex justify-content-between mt-3">
                                    <Button variant="outline-secondary" onClick={() => navigate(`/positions/${position.id}/edit`)} className="me-2">Editar</Button>
                                    <Button variant="primary" onClick={() => navigate(`/positions/${position.id}`)}>Ver proceso</Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default Positions;