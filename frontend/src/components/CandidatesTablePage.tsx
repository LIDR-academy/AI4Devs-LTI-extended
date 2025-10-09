import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import TableDemo from './TableDemo';

const CandidatesTablePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container className="mt-5">
      <Button
        variant="link"
        onClick={() => navigate('/')}
        className="mb-3"
        aria-label="Volver al Dashboard del Reclutador"
      >
        Volver al Dashboard
      </Button>
      <h2 className="text-center mb-4">Lista de Candidatos</h2>

      <TableDemo />
    </Container>
  );
};

export default CandidatesTablePage;
