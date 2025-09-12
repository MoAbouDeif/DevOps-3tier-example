// src/components/HistoryItem.js
import React from 'react';

const HistoryItem = ({ item, onViewDetails, onEdit, onDelete }) => {
  const operationSymbols = {
    add: '+',
    subtract: '-',
    multiply: '×',
    divide: '÷'
  };

  return (
    <div className="history-item">
      <div className="calculation">
        {item.a} {operationSymbols[item.operation]} {item.b} = <strong>{item.result}</strong>
      </div>
      <div className="item-date">
        {new Date(item.created_at).toLocaleString()}
      </div>
      <div className="item-actions">
        <button onClick={() => onViewDetails(item.id)} className="action-btn view">
          <i className="fas fa-eye"></i>
        </button>
        <button onClick={() => onEdit(item)} className="action-btn edit">
          <i className="fas fa-edit"></i>
        </button>
        <button onClick={() => onDelete(item.id)} className="action-btn delete">
          <i className="fas fa-trash"></i>
        </button>
      </div>
    </div>
  );
};

export default HistoryItem;