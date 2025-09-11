import React from 'react';

const CalculationModal = ({ calculation, onClose }) => {
  if (!calculation) return null;

  const getOperationSymbol = (operation) => {
    switch (operation) {
      case 'add': return '+';
      case 'subtract': return '−';
      case 'multiply': return '×';
      case 'divide': return '÷';
      default: return operation;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Calculation Details</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          <div className="detail-row">
            <span className="detail-label">Operation:</span>
            <span className="detail-value">{calculation.operand1} {getOperationSymbol(calculation.operation)} {calculation.operand2}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Result:</span>
            <span className="detail-value">{calculation.result}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Performed at:</span>
            <span className="detail-value">{formatDate(calculation.created_at)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Calculation ID:</span>
            <span className="detail-value">#{calculation.id}</span>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default CalculationModal;