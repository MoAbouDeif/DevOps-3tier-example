// src/components/HistoryTab.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import HistoryItem from './HistoryItem';
import EditModal from './EditModal';
import DetailModal from './DetailModal';

const HistoryTab = ({ showNotification, setLoading }) => {
  const [history, setHistory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const abortControllerRef = useRef(null);

  const fetchHistory = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/history', {
        signal: abortControllerRef.current.signal,
      });
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();

      console.log("History API response:", data);

      // Ensure history is always an array
      if (Array.isArray(data)) {
        setHistory(data);
      } else if (Array.isArray(data.history)) {
        setHistory(data.history);
      } else {
        setHistory([]); // fallback to empty array
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        showNotification('Failed to fetch history');
      }
    } finally {
      setLoading(false);
    }
  }, [setLoading, showNotification]);

  useEffect(() => {
    fetchHistory();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchHistory]);

  const handleViewDetails = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/calculation/${id}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch calculation details');
      }
      setSelectedItem(data);
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this calculation?')) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/calculation/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete calculation');
      }
      showNotification('Calculation deleted successfully', 'success');
      await fetchHistory();
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updatedData) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/calculation/${selectedItem.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update calculation');
      }
      showNotification('Calculation updated successfully', 'success');
      setEditModalOpen(false);
      await fetchHistory();
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="history-tab">
      <div className="history-header">
        <h2>Recent Calculations</h2>
        <button
          onClick={fetchHistory}
          className="refresh-btn"
          data-testid="refresh-button"
        >
          <i className="fas fa-sync-alt"></i> Refresh
        </button>
      </div>

      {history.length === 0 ? (
        <p className="no-history">No calculation history found.</p>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <HistoryItem
              key={item.id}
              item={item}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {selectedItem && editModalOpen && (
        <EditModal
          item={selectedItem}
          onClose={() => setEditModalOpen(false)}
          onUpdate={handleUpdate}
        />
      )}

      {selectedItem && !editModalOpen && (
        <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
};

export default HistoryTab;
