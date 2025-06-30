import React, { useState, useEffect } from 'react';
import { Offcanvas, Form, Button } from 'react-bootstrap';

const CandidateDetails = ({ candidate, onClose }) => {
    const [candidateDetails, setCandidateDetails] = useState(null);
    const [newInterview, setNewInterview] = useState({
        notes: '',
        score: 0
    });

    useEffect(() => {
        if (candidate) {
            fetch(`http://localhost:3010/candidates/${candidate.id}`)
                .then(response => response.json())
                .then(data => setCandidateDetails(data))
                .catch(error => console.error('Error fetching candidate details:', error));
        }
    }, [candidate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewInterview({
            ...newInterview,
            [name]: value
        });
    };

    const handleScoreChange = (score) => {
        setNewInterview({
            ...newInterview,
            score
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch(`http://localhost:3010/candidates/${candidate.id}/interviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newInterview)
        })
            .then(response => response.json())
            .then(data => {
                // Update the candidate details with the new interview
                setCandidateDetails(prevDetails => ({
                    ...prevDetails,
                    applications: prevDetails.applications.map(app => {
                        if (app.id === data.applicationId) {
                            return {
                                ...app,
                                interviews: [...app.interviews, data]
                            };
                        }
                        return app;
                    })
                }));
                // Reset the form
                setNewInterview({
                    notes: '',
                    score: 0
                });
                // Close the panel
                onClose();
            })
            .catch(error => console.error('Error creating interview:', error))
            .finally(() => onClose())
    };

    return (
        <Offcanvas show={!!candidate} onHide={onClose} placement="end">
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Detalles del Candidato</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                {candidateDetails ? (
                    <>
                        <h5>{candidateDetails.firstName} {candidateDetails.lastName}</h5>
                        <p>Email: {candidateDetails.email}</p>
                        <p>Teléfono: {candidateDetails.phone}</p>
                        <p>Dirección: {candidateDetails.address}</p>
                        <h5>Educación</h5>
                        {candidateDetails.educations.map(edu => (
                            <div key={edu.id}>
                                <p>{edu.institution} - {edu.title}</p>
                                <p>{new Date(edu.startDate).toLocaleDateString()} - {new Date(edu.endDate).toLocaleDateString()}</p>
                            </div>
                        ))}
                        <h5>Experiencias Laborales</h5>
                        {candidateDetails.workExperiences.map(work => (
                            <div key={work.id}>
                                <p>{work.company} - {work.position}</p>
                                <p>{work.description}</p>
                                <p>{new Date(work.startDate).toLocaleDateString()} - {new Date(work.endDate).toLocaleDateString()}</p>
                            </div>
                        ))}
                        <h5>Curriculums</h5>
                        {candidateDetails.resumes.map(resume => (
                            <div key={resume.id}>
                                <p><a href={resume.filePath} target="_blank" rel="noopener noreferrer">Descargar Curriculum</a></p>
                            </div>
                        ))}
                        <h5>Solicitudes</h5>
                        {candidateDetails.applications.map(app => (
                            <div key={app.id}>
                                <p>Posición: {app.position.title}</p>
                                <p>Fecha de Solicitud: {new Date(app.applicationDate).toLocaleDateString()}</p>
                                <h5>Entrevistas</h5>
                                {app.interviews.map(interview => (
                                    <div key={interview.interviewDate}>
                                        <p>Fecha de la Entrevista: {new Date(interview.interviewDate).toLocaleDateString()}</p>
                                        <p>Etapa: {interview.interviewStep.name}</p>
                                        <p>Notas: {interview.notes}</p>
                                        <p>Puntuación: {interview.score}</p>
                                    </div>
                                ))}
                            </div>
                        ))}
                        <h5>Registrar Nueva Entrevista</h5>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group controlId="formNotes">
                                <Form.Label>Notas</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="notes"
                                    value={newInterview.notes}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                            <Form.Group controlId="formScore">
                                <Form.Label>Puntuación</Form.Label>
                                <div>
                                    {[1, 2, 3, 4, 5].map(score => (
                                        <span
                                            key={score}
                                            style={{
                                                cursor: 'pointer',
                                                color: newInterview.score >= score ? 'gold' : 'gray'
                                            }}
                                            onClick={() => handleScoreChange(score)}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </Form.Group>
                            <Button variant="primary" type="submit">
                                Registrar
                            </Button>
                        </Form>
                    </>
                ) : (
                    <p>Cargando...</p>
                )}
            </Offcanvas.Body>
        </Offcanvas>
    );
};


export default CandidateDetails;
