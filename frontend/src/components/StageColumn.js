import React from 'react';
import { Col, Card } from 'react-bootstrap';
import { Droppable } from 'react-beautiful-dnd';
import CandidateCard from './CandidateCard';

const StageColumn = ({ stage, index, onCardClick }) => {
    // Ordenar candidatos por rating (score) de mayor a menor
    const sortedCandidates = [...stage.candidates].sort((a, b) => {
        // Si alguno de los ratings es undefined o null, tratarlo como 0
        const ratingA = a.rating ?? 0;
        const ratingB = b.rating ?? 0;
        return ratingB - ratingA;
    });

    return (
        <Col md={3}>
            <Droppable droppableId={`${index}`}>
                {(provided) => (
                    <Card className="mb-4" ref={provided.innerRef} {...provided.droppableProps}>
                        <Card.Header className="text-center">{stage.title}</Card.Header>
                        <Card.Body>
                            {sortedCandidates.map((candidate, idx) => (
                                <CandidateCard 
                                    key={candidate.id} 
                                    candidate={candidate} 
                                    index={idx} 
                                    onClick={onCardClick} 
                                />
                            ))}
                            {provided.placeholder}
                        </Card.Body>
                    </Card>
                )}
            </Droppable>
        </Col>
    );
};

export default StageColumn;
