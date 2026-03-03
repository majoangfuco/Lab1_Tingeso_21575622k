import React, { useState } from 'react';
import PropTypes from 'prop-types';
import HelpModal from './HelpModal';
import './PageLayout.css';

const PageLayout = ({ children, tutorialData }) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className="page-layout">
      <button 
        className="help-button"
        onClick={() => setIsHelpOpen(true)}
        title="¿Necesitas ayuda?"
      >
        ¿Necesitas ayuda?
      </button>

      <div className="page-layout-content">
        {children}
      </div>

      {tutorialData && (
        <HelpModal 
          isOpen={isHelpOpen} 
          onClose={() => setIsHelpOpen(false)}
          tutorialData={tutorialData}
        />
      )}
    </div>
  );
};

PageLayout.propTypes = {
  children: PropTypes.node.isRequired,
  tutorialData: PropTypes.shape({
    home: PropTypes.shape({
      title: PropTypes.string.isRequired,
      steps: PropTypes.arrayOf(
        PropTypes.shape({
          title: PropTypes.string.isRequired,
          description: PropTypes.string.isRequired,
        })
      ).isRequired,
    }),
  }),
};

PageLayout.defaultProps = {
  tutorialData: null,
};

export default PageLayout;
