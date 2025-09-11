import React, { useEffect, useState } from 'react';
import { getHistory, deleteCalculation } from '../services/api';
import CalculationModal from './CalculationModal';
import ExportOptions from './ExportOptions';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCalculation, setSelectedCalculation] = useState(null);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await getHistory();
      setHistory(response.history || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this calculation?')) {
      try {
        // Add API call to delete calculation
        // await deleteCalculation(id);
        setHistory(history.filter(item => item.id !== id));
      } catch (err) {
        setError('Failed to delete calculation');
      }
    }
  };

  if (loading) {
    return (
      <div className="history-section" data-testid="history-loading">
        <div className="history-header">
          <h3><i className="fas fa-history"></i> Calculation History</h3>
          <button 
            className="export-toggle" 
            onClick={() => setShowExport(true)}
            aria-label="Export history"
          >
            <i className="fas fa-download"></i>
          </button>
        </div>
        <div className="spinner" data-testid="spinner">
          <div className="bounce1"></div>
          <div className="bounce2"></div>
          <div className="bounce3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-section" data-testid="history-error">
        <div className="history-header">
          <h3><i className="fas fa-history"></i> Calculation History</h3>
          <button 
            className="export-toggle" 
            onClick={() => setShowExport(true)}
            aria-label="Export history"
          >
            <i className="fas fa-download"></i>
          </button>
        </div>
        <div className="result error">Error: {error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="history-section" data-testid="history-section">
        <div className="history-header">
          <h3><i className="fas fa-history"></i> Calculation History</h3>
          {history.length > 0 && (
            <button 
              className="export-toggle" 
              onClick={() => setShowExport(true)}
              aria-label="Export history"
              title="Export history"
            >
              <i className="fas fa-download"></i>
            </button>
          )}
        </div>
        <ul data-testid="history-list">
          {history.length === 0 ? (
            <li data-testid="no-history">No calculation history found</li>
          ) : (
            history.map((item) => (
              <li 
                key={item.id} 
                data-testid="history-item"
                onClick={() => setSelectedCalculation(item)}
                className="history-item"
              >
                <div className="history-calculation">
                  <span>{item.operand1} {getOperationSymbol(item.operation)} {item.operand2}</span>
                  <strong>= {item.result}</strong>
                </div>
                <div className="history-actions">
                  <button 
                    className="history-action-btn"
                    onClick={(e) => handleDelete(item.id, e)}
                    aria-label="Delete calculation"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
                <div className="history-timestamp">
                  {formatDate(item.created_at)}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {selectedCalculation && (
        <CalculationModal 
          calculation={selectedCalculation} 
          onClose={() => setSelectedCalculation(null)} 
        />
      )}

      {showExport && (
        <ExportOptions 
          history={history} 
          onClose={() => setShowExport(false)} 
        />
      )}
    </>
  );
};

// Helper functions
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
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export default History;