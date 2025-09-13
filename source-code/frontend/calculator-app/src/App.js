// src/App.js
import React, { useState } from 'react';
import CalculatorTab from './components/CalculatorTab';
import HistoryTab from './components/HistoryTab';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('calculator');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  return (
    <div className="app">
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <div className="calculator-container">
        <header className="app-header">
          <img 
            src="https://cdn-icons-png.flaticon.com/512/10008/10008845.png" 
            alt="Calculator Logo" 
            className="app-logo"
          />
          <h1>Simple Calculator</h1>
          <p>Perform calculations and track your history</p>
        </header>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'calculator' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculator')}
          >
            <i className="fas fa-calculator"></i> Calculator
          </button>
          <button 
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <i className="fas fa-history"></i> History
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'calculator' ? (
            <CalculatorTab 
              showNotification={showNotification} 
              setLoading={setLoading}
            />
          ) : (
            <HistoryTab 
              showNotification={showNotification} 
              setLoading={setLoading}
            />
          )}
        </div>

        {loading && (
          <div className="loader-overlay" data-testid="loader-overlay">
            <div className="loader"></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
