import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Offcanvas, Button } from 'react-bootstrap';
import { DragDropContext } from 'react-beautiful-dnd';
import StageColumn from './StageColumn';
import CandidateDetails from './CandidateDetails';
import { useNavigate } from 'react-router-dom';

const PositionsDetails = () => {
    const { id } = useParams();
    const [stages, setStages] = useState([]);
    const [positionName, setPositionName] = useState('');
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInterviewFlow = async () => {
            try {
                const response = await fetch(`http://localhost:3010/positions/${id}/interviewFlow`);
                const data = await response.json();
                const interviewSteps = data.interviewFlow.interviewFlow.interviewSteps.map(step => ({
                    title: step.name,
                    id: step.id,
                    candidates: []
                }));
                setStages(interviewSteps);
                setPositionName(data.interviewFlow.positionName);
            } catch (error) {
                console.error('Error fetching interview flow:', error);
            }
        };

        const fetchCandidates = async () => {
            try {
                const response = await fetch(`http://localhost:3010/positions/${id}/candidates`);
                const candidates = await response.json();
                setStages(prevStages =>
                    prevStages.map(stage => ({
                        ...stage,
                        candidates: candidates
                            .filter(candidate => candidate.currentInterviewStep === stage.title)
                            .map(candidate => ({
                                id: candidate.candidateId.toString(),
                                name: candidate.fullName,
                                rating: candidate.averageScore,
                                applicationId: candidate.applicationId
                            }))
                    }))
                );
            } catch (error) {
                console.error('Error fetching candidates:', error);
            }
        };

        fetchInterviewFlow();
        fetchCandidates();
    }, [id]);

    const updateCandidateStep = async (candidateId, applicationId, newStep) => {
        try {
            const response = await fetch(`http://localhost:3010/candidates/${candidateId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    applicationId: Number(applicationId),
                    currentInterviewStep: Number(newStep)
                })
            });

            if (!response.ok) {
                throw new Error('Error updating candidate step');
            }
        } catch (error) {
            console.error('Error updating candidate step:', error);
        }
    };

    const onDragEnd = (result) => {
        const { source, destination } = result;

        if (!destination) {
            return;
        }

        const sourceStage = stages[source.droppableId];
        const destStage = stages[destination.droppableId];

        const [movedCandidate] = sourceStage.candidates.splice(source.index, 1);
        destStage.candidates.splice(destination.index, 0, movedCandidate);

        setStages([...stages]);

        const destStageId = stages[destination.droppableId].id;

        updateCandidateStep(movedCandidate.id, movedCandidate.applicationId, destStageId);
    };

    const handleCardClick = (candidate) => {
        setSelectedCandidate(candidate);
    };

    const closeSlide = () => {
        setSelectedCandidate(null);
    };

    return (
        <Container className="mt-5">
            <Button variant="link" onClick={() => navigate('/positions')} className="mb-3">
                Volver a Posiciones
            </Button>
            <h2 className="text-center mb-4">{positionName}</h2>
            <DragDropContext onDragEnd={onDragEnd}>
                <Row>
                    {stages.map((stage, index) => (
                        <StageColumn key={index} stage={stage} index={index} onCardClick={handleCardClick} />
                    ))}
                </Row>
            </DragDropContext>
            <CandidateDetails candidate={selectedCandidate} onClose={closeSlide} />
        </Container>
    );
};

export default PositionsDetails;

