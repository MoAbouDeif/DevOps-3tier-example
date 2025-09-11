import React, { useState, useEffect } from 'react';
import { calculate } from '../services/api';
import AdvancedOperations from './AdvancedOperations';

const Calculator = () => {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [operation, setOperation] = useState('add');
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputErrors, setInputErrors] = useState({ a: false, b: false });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Real-time validation
  useEffect(() => {
    validateInput('a', a);
  }, [a]);

  useEffect(() => {
    validateInput('b', b);
  }, [b]);

  const validateInput = (field, value) => {
    if (!value.trim()) {
      setInputErrors(prev => ({ ...prev, [field]: false }));
      return;
    }

    const numValue = parseFloat(value);
    const isValid = !isNaN(numValue) && Math.abs(numValue) <= 1e100;
    setInputErrors(prev => ({ ...prev, [field]: !isValid }));
  };

  const handleAdvancedOperation = (op) => {
    switch(op) {
      case 'square':
        if (a) {
          const numA = parseFloat(a);
          setResult(numA * numA);
          // Save to history
        }
        break;
      case 'squareRoot':
        if (a && parseFloat(a) >= 0) {
          const numA = parseFloat(a);
          setResult(Math.sqrt(numA));
          // Save to history
        } else {
          setError('Cannot calculate square root of negative number');
        }
        break;
      // Implement other advanced operations
      default:
        break;
    }
  };

  // Rest of the component remains similar with added advanced operations section

  return (
    <div className="card">
      <div className="input-group">
        <label htmlFor="a"><i className="fas fa-number"></i> First Number</label>
        <input 
          id="a" 
          type="number" 
          placeholder="Enter first number" 
          value={a}
          onChange={(e) => setA(e.target.value)}
          data-testid="first-number-input"
          className={inputErrors.a ? 'input-error' : ''}
          min="-1e100"
          max="1e100"
          step="any"
        />
        {inputErrors.a && (
          <div className="input-error-message">Please enter a valid number</div>
        )}
      </div>

      <div className="operation-selector">
        <label htmlFor="operation"><i className="fas fa-calculator"></i> Operation</label>
        <div className="operation-buttons">
          {['add', 'subtract', 'multiply', 'divide'].map(op => (
            <button
              key={op}
              type="button"
              className={`op-btn ${operation === op ? 'active' : ''}`}
              onClick={() => handleOperationChange(op)}
              aria-label={op}
              data-testid={`${op}-button`}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleOperationChange(op)}
            >
              <i 
                className={`fas fa-${getOperationIcon(op)}`} 
                aria-hidden="true"
                title={op.charAt(0).toUpperCase() + op.slice(1)}
              ></i>
            </button>
          ))}
        </div>
        <select 
          id="operation"
          value={operation}
          onChange={(e) => setOperation(e.target.value)}
          data-testid="operation-select"
          aria-label="Select operation"
        >
          <option value="add">Addition (+)</option>
          <option value="subtract">Subtraction (−)</option>
          <option value="multiply">Multiplication (×)</option>
          <option value="divide">Division (÷)</option>
        </select>
        
        <div className="advanced-toggle">
          <button 
            type="button" 
            className="btn-link"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Hide Advanced' : 'Show Advanced'} 
            <i className={`fas fa-chevron-${showAdvanced ? 'up' : 'down'}`}></i>
          </button>
        </div>
        
        {showAdvanced && (
          <AdvancedOperations onOperationSelect={handleAdvancedOperation} />
        )}
      </div>

      <div className="input-group">
        <label htmlFor="b"><i className="fas fa-number"></i> Second Number</label>
        <input 
          id="b" 
          type="number" 
          placeholder="Enter second number" 
          value={b}
          onChange={(e) => setB(e.target.value)}
          data-testid="second-number-input"
          className={inputErrors.b ? 'input-error' : ''}
          min="-1e100"
          max="1e100"
          step="any"
        />
        {inputErrors.b && (
          <div className="input-error-message">Please enter a valid number</div>
        )}
      </div>

      <button 
        className="calculate-btn"
        onClick={handleSubmit}
        disabled={isLoading || inputErrors.a || inputErrors.b || !a || !b}
        data-testid="calculate-button"
        aria-busy={isLoading}
      >
        <span className="btn-text">Calculate</span>
        {isLoading && (
          <div className="spinner" data-testid="spinner">
            <div className="bounce1"></div>
            <div className="bounce2"></div>
            <div className="bounce3"></div>
          </div>
        )}
      </button>

      {result && (
        <div className="result success" data-testid="result-success">
          Result: {result}
        </div>
      )}
      
      {error && (
        <div className="result error" data-testid="result-error">
          Error: {error}
        </div>
      )}
    </div>
  );
};

// Keep the rest of the component logic

export default Calculator;