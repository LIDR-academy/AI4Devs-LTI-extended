import React from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  to?: string;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ to = '/', className = "mb-3" }) => {
  const navigate = useNavigate();

  return (
    <Button 
      variant="outline-secondary" 
      onClick={() => navigate(to)} 
      className={className}
      aria-label="Volver al Dashboard"
    >
      <svg 
        width="16" 
        height="16" 
        fill="currentColor" 
        viewBox="0 0 16 16"
        style={{ marginRight: '8px' }}
      >
        <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
      </svg>
      Volver al Dashboard
    </Button>
  );
};

export default BackButton;