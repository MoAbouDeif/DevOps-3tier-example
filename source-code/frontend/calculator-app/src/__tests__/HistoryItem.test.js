// src/__tests__/HistoryItem.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HistoryItem from '../components/HistoryItem';

describe('HistoryItem', () => {
  it('calls action handlers on button clicks', () => {
    const item = { id: 1, a: 3, b: 4, operation: 'add', result: 7, created_at: new Date().toISOString() };
    const onViewDetails = jest.fn();
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    render(<HistoryItem item={item} onViewDetails={onViewDetails} onEdit={onEdit} onDelete={onDelete} />);

    fireEvent.click(screen.getByLabelText('view'));
    fireEvent.click(screen.getByLabelText('edit'));
    fireEvent.click(screen.getByLabelText('delete'));

    expect(onViewDetails).toHaveBeenCalledWith(1);
    expect(onEdit).toHaveBeenCalledWith(item);
    expect(onDelete).toHaveBeenCalledWith(1);
  });
});
