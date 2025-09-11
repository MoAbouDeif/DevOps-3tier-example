import React from 'react';

const AdvancedOperations = ({ onOperationSelect }) => {
  const advancedOps = [
    { symbol: 'x²', operation: 'square', label: 'Square' },
    { symbol: '√', operation: 'squareRoot', label: 'Square Root' },
    { symbol: '1/x', operation: 'reciprocal', label: 'Reciprocal' },
    { symbol: '±', operation: 'toggleSign', label: 'Toggle Sign' },
    { symbol: '%', operation: 'percentage', label: 'Percentage' },
    { symbol: 'x!', operation: 'factorial', label: 'Factorial' }
  ];

  return (
    <div className="advanced-operations">
      <h4>Advanced Operations</h4>
      <div className="advanced-buttons">
        {advancedOps.map(op => (
          <button
            key={op.operation}
            className="adv-op-btn"
            onClick={() => onOperationSelect(op.operation)}
            aria-label={op.label}
            title={op.label}
          >
            {op.symbol}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdvancedOperations;