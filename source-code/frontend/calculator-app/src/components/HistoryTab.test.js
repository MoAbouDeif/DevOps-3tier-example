// src/components/HistoryTab.test.js
import { render, screen } from '@testing-library/react';
import HistoryTab from './HistoryTab';

// Mock the fetch function
global.fetch = jest.fn();

// Mock child components with display names
jest.mock('./HistoryItem', () => {
  const HistoryItem = ({ item, onViewDetails, onEdit, onDelete }) => (
    <div data-testid="history-item">
      {item.a} + {item.b} = {item.result}
      <button onClick={() => onViewDetails(item.id)}>View</button>
      <button onClick={() => onEdit(item)}>Edit</button>
      <button onClick={() => onDelete(item.id)}>Delete</button>
    </div>
  );
  HistoryItem.displayName = 'HistoryItem';
  return HistoryItem;
});

jest.mock('./EditModal', () => {
  const EditModal = () => <div data-testid="edit-modal">Edit Modal</div>;
  EditModal.displayName = 'EditModal';
  return EditModal;
});

jest.mock('./DetailModal', () => {
  const DetailModal = () => <div data-testid="detail-modal">Detail Modal</div>;
  DetailModal.displayName = 'DetailModal';
  return DetailModal;
});

describe('HistoryTab', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders history tab', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<HistoryTab showNotification={jest.fn()} setLoading={jest.fn()} />);

    // `findByText` waits for UI updates and auto-wraps in `act`
    expect(await screen.findByText(/Recent Calculations/i)).toBeInTheDocument();
    expect(await screen.findByText(/Refresh/i)).toBeInTheDocument();
  });

  test('fetches and displays history', async () => {
    const mockHistory = [
      { id: '1', a: 2, b: 3, operation: 'add', result: 5, created_at: '2023-01-01' },
      { id: '2', a: 5, b: 2, operation: 'subtract', result: 3, created_at: '2023-01-02' },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockHistory,
    });

    render(<HistoryTab showNotification={jest.fn()} setLoading={jest.fn()} />);

    const items = await screen.findAllByTestId('history-item');
    expect(items).toHaveLength(2);
  });

  test('shows error message when fetch fails', async () => {
    const mockShowNotification = jest.fn();

    fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<HistoryTab showNotification={mockShowNotification} setLoading={jest.fn()} />);

    // Wait until notification is called
    await screen.findByText(/No calculation history found/i);
    expect(mockShowNotification).toHaveBeenCalledWith('Failed to fetch history');
  });
});
