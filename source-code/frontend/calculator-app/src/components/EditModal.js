// src/components/EditModal.js
import React, { useState } from 'react';

const EditModal = ({ item, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    a: item.a,
    b: item.b,
    operation: item.operation
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.a || isNaN(Number(formData.a))) newErrors.a = 'Valid number required';
    if (!formData.b || isNaN(Number(formData.b))) newErrors.b = 'Valid number required';
    else if (formData.operation === 'divide' && Number(formData.b) === 0) {
      newErrors.b = 'Cannot divide by zero';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onUpdate({
        a: Number(formData.a),
        b: Number(formData.b),
        operation: formData.operation
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Edit Calculation</h3>
          <button onClick={onClose} className="close-btn">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="input-group">
            <label htmlFor="edit-a">First Number</label>
            <input
              type="number"
              id="edit-a"
              name="a"
              value={formData.a}
              onChange={handleChange}
              className={errors.a ? 'error' : ''}
            />
            {errors.a && <span className="error-text">{errors.a}</span>}
          </div>
          
          <div className="input-group">
            <label htmlFor="edit-operation">Operation</label>
            <select
              id="edit-operation"
              name="operation"
              value={formData.operation}
              onChange={handleChange}
            >
              <option value="add">Add (+)</option>
              <option value="subtract">Subtract (-)</option>
              <option value="multiply">Multiply (×)</option>
              <option value="divide">Divide (÷)</option>
            </select>
          </div>
          
          <div className="input-group">
            <label htmlFor="edit-b">Second Number</label>
            <input
              type="number"
              id="edit-b"
              name="b"
              value={formData.b}
              onChange={handleChange}
              className={errors.b ? 'error' : ''}
            />
            {errors.b && <span className="error-text">{errors.b}</span>}
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;