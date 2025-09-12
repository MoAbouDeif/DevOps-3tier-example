// src/components/DetailModal.js
import React from 'react';

const DetailModal = ({ item, onClose }) => {
  const operationSymbols = {
    add: '+',
    subtract: '-',
    multiply: '×',
    divide: '÷'
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Calculation Details</h3>
          <button onClick={onClose} className="close-btn">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="detail-content">
          <p><strong>ID:</strong> {item.id}</p>
          <p><strong>Calculation:</strong> {item.a} {operationSymbols[item.operation]} {item.b} = {item.result}</p>
          <p><strong>Operation:</strong> {item.operation}</p>
          <p><strong>Created at:</strong> {new Date(item.created_at).toLocaleString()}</p>
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="close-details-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;