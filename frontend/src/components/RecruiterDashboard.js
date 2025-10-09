import React from 'react';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logo from '../assets/lti-logo.png'; // Ruta actualizada para importar desde src/assets

const RecruiterDashboard = () => {
    return (
        <Container className="mt-5 mb-5">
            <div className="text-center"> {/* Contenedor para el logo */}
                <img src={logo} alt="LTI Logo" className="logo-responsive" />
            </div>
            <h1 className="mb-4 text-center">Dashboard del Reclutador</h1>
            <Row>
                <Col md={4}>
                    <Card className="shadow p-4">
                        <h5 className="mb-4">Añadir Candidato</h5>
                        <Link to="/add-candidate">
                            <Button variant="primary" className="w-100">Añadir Nuevo Candidato</Button>
                        </Link>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow p-4">
                        <h5 className="mb-4">Ver Candidatos</h5>
                        <Link to="/candidates">
                            <Button variant="primary" className="w-100">Ir a Candidatos</Button>
                        </Link>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow p-4">
                        <h5 className="mb-4">Ver Posiciones</h5>
                        <Link to="/positions">
                            <Button variant="primary" className="w-100">Ir a Posiciones</Button>
                        </Link>
                    </Card>
                </Col>
            </Row>
            <Row className="mt-4 justify-content-center">
                <Col md={4}>
                    <Card className="shadow p-4">
                        <h5 className="mb-4">Lista de Candidatos</h5>
                        <Link to="/candidates-table">
                            <Button variant="primary" className="w-100">Ver Tabla de Candidatos</Button>
                        </Link>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default RecruiterDashboard;