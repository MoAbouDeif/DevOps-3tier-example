// src/__tests__/EditModal.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EditModal from '../components/EditModal';

describe('EditModal', () => {
  it('submits updated calculation', () => {
    const item = { id: 1, a: 3, b: 4, operation: 'add' };
    const onUpdate = jest.fn();
    render(<EditModal item={item} onClose={() => {}} onUpdate={onUpdate} />);

    const firstNumber = screen.getByLabelText(/First Number/i);
    fireEvent.change(firstNumber, { target: { value: '5' } });

    fireEvent.click(screen.getByText(/Save Changes/i));

    expect(onUpdate).toHaveBeenCalledWith({ a: 5, b: 4, operation: 'add' });
  });
});
