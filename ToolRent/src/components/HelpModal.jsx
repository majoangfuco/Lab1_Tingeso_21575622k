import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './HelpModal.css';

const HelpModal = ({ isOpen, onClose, tutorialData }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < tutorialData.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const step = tutorialData.steps[currentStep];

  return (
    <div 
      className="help-modal-overlay" 
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <dialog 
        className="help-modal-content" 
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Escape') {
            onClose();
          }
        }}
        open
        aria-labelledby="help-modal-title"
      >
        <div className="help-modal-header">
          <h2 id="help-modal-title">{tutorialData.title}</h2>
          <button className="help-modal-close" onClick={onClose} aria-label="Close modal">&times;</button>
        </div>

        <div className="help-modal-body">
          <div className="help-step-counter">
            Paso {currentStep + 1} de {tutorialData.steps.length}
          </div>
          
          <h3>{step.title}</h3>
          <p>{step.description}</p>

          <div className="help-step-indicators">
            {tutorialData.steps.map((step, index) => (
              <button
                key={step.title}
                className={`help-dot ${index === currentStep ? 'active' : ''}`}
                onClick={() => setCurrentStep(index)}
                aria-label={`Go to step ${index + 1}`}
                aria-pressed={index === currentStep}
              />
            ))}
          </div>
        </div>

        <div className="help-modal-footer">
          <button 
            className="help-btn help-btn-prev" 
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            Anterior
          </button>
          
          <button 
            className="help-btn help-btn-next" 
            onClick={handleNext}
            disabled={currentStep === tutorialData.steps.length - 1}
          >
            Siguiente
          </button>

          <button 
            className="help-btn help-btn-close" 
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </dialog>
    </div>
  );
};

HelpModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  tutorialData: PropTypes.shape({
    title: PropTypes.string.isRequired,
    steps: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default HelpModal;
