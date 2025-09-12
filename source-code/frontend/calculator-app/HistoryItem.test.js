// src/components/HistoryItem.test.js
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HistoryItem from './HistoryItem';

describe('HistoryItem', () => {
  const mockItem = {
    id: '1',
    a: 2,
    b: 3,
    operation: 'add',
    result: 5,
    created_at: '2023-01-01T00:00:00.000Z'
  };

  const mockOnViewDetails = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  test('renders history item', () => {
    render(
      <HistoryItem
        item={mockItem}
        onViewDetails={mockOnViewDetails}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText(/2 \+ 3 = 5/i)).toBeInTheDocument();
    expect(screen.getByText(/view/i)).toBeInTheDocument();
    expect(screen.getByText(/edit/i)).toBeInTheDocument();
    expect(screen.getByText(/delete/i)).toBeInTheDocument();
  });

  test('calls onViewDetails when view button is clicked', () => {
    render(
      <HistoryItem
        item={mockItem}
        onViewDetails={mockOnViewDetails}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    const viewButton = screen.getByText(/view/i);
    userEvent.click(viewButton);
    
    expect(mockOnViewDetails).toHaveBeenCalledWith('1');
  });

  test('calls onEdit when edit button is clicked', () => {
    render(
      <HistoryItem
        item={mockItem}
        onViewDetails={mockOnViewDetails}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    const editButton = screen.getByText(/edit/i);
    userEvent.click(editButton);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockItem);
  });

  test('calls onDelete when delete button is clicked', () => {
    render(
      <HistoryItem
        item={mockItem}
        onViewDetails={mockOnViewDetails}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    const deleteButton = screen.getByText(/delete/i);
    userEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });
});