import React from 'react';
import { Button } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ to = '/', className = 'mb-3', variant = 'outline-secondary', ...props }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(to);
  };

  return (
    <Button 
      variant={variant} 
      onClick={handleClick} 
      className={className}
      {...props}
    >
      <ArrowLeft size={16} className="me-1" />
      Volver
    </Button>
  );
};

export default BackButton;