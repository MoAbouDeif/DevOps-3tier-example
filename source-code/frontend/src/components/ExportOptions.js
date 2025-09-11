import React from 'react';

const ExportOptions = ({ history, onClose }) => {
  const exportCSV = () => {
    const headers = 'ID,Operand1,Operation,Operand2,Result,Timestamp\n';
    const csvContent = history.map(calc => 
      `${calc.id},${calc.operand1},${calc.operation},${calc.operand2},${calc.result},"${calc.created_at}"`
    ).join('\n');
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calculation-history.csv';
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  const exportJSON = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calculation-history.json';
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <div className="export-modal">
      <div className="export-options">
        <h3>Export History</h3>
        <p>Select export format:</p>
        <div className="export-buttons">
          <button onClick={exportCSV} className="export-btn">
            <i className="fas fa-file-csv"></i> CSV
          </button>
          <button onClick={exportJSON} className="export-btn">
            <i className="fas fa-file-code"></i> JSON
          </button>
        </div>
        <button onClick={onClose} className="btn-secondary">Cancel</button>
      </div>
    </div>
  );
};

export default ExportOptions;