// src/components/CalculatorTab.js
import React, { useState } from 'react';

const CalculatorTab = ({ showNotification, setLoading }) => {
  const [formData, setFormData] = useState({
    a: '',
    b: '',
    operation: 'add'
  });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    // Check if inputs are empty
    if (!formData.a.trim()) {
      newErrors.a = 'First number is required';
    } else if (isNaN(Number(formData.a))) {
      newErrors.a = 'Must be a valid number';
    }
    
    if (!formData.b.trim()) {
      newErrors.b = 'Second number is required';
    } else if (isNaN(Number(formData.b))) {
      newErrors.b = 'Must be a valid number';
    } else if (formData.operation === 'divide' && Number(formData.b) === 0) {
      newErrors.b = 'Cannot divide by zero';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          a: Number(formData.a),
          b: Number(formData.b),
          operation: formData.operation
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Calculation failed');
      }
      
      setResult(data.result);
      showNotification('Calculation successful!', 'success');
      
      // Reset form
      setFormData({
        a: '',
        b: '',
        operation: 'add'
      });
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="calculator-tab">
      <form onSubmit={handleSubmit} className="calculator-form">
        <div className="input-group">
          <label htmlFor="a">First Number</label>
          <input
            type="text"
            id="a"
            name="a"
            value={formData.a}
            onChange={handleChange}
            className={errors.a ? 'error' : ''}
            data-testid="first-number-input"
          />
          {errors.a && <span className="error-text" data-testid="error-a">{errors.a}</span>}
        </div>
        
        <div className="input-group">
          <label htmlFor="operation">Operation</label>
          <select
            id="operation"
            name="operation"
            value={formData.operation}
            onChange={handleChange}
            data-testid="operation-select"
          >
            <option value="add">Add (+)</option>
            <option value="subtract">Subtract (-)</option>
            <option value="multiply">Multiply (×)</option>
            <option value="divide">Divide (÷)</option>
          </select>
        </div>
        
        <div className="input-group">
          <label htmlFor="b">Second Number</label>
          <input
            type="text"
            id="b"
            name="b"
            value={formData.b}
            onChange={handleChange}
            className={errors.b ? 'error' : ''}
            data-testid="second-number-input"
          />
          {errors.b && <span className="error-text" data-testid="error-b">{errors.b}</span>}
        </div>
        
        <button 
          type="submit" 
          className="calculate-btn"
          data-testid="calculate-button"
        >
          Calculate
        </button>
      </form>
      
      {result !== null && (
        <div className="result-display">
          <h3>Result: {result}</h3>
        </div>
      )}
    </div>
  );
};

export default CalculatorTab;