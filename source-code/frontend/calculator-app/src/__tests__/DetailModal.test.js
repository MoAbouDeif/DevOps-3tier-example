// src/__tests__/DetailModal.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import DetailModal from '../components/DetailModal';

describe('DetailModal', () => {
  it('renders calculation details', () => {
    const item = { id: 1, a: 3, b: 4, operation: 'add', result: 7, created_at: new Date().toISOString() };
    render(<DetailModal item={item} onClose={() => {}} />);
    expect(screen.getByText(/Calculation Details/i)).toBeInTheDocument();
    expect(screen.getByText(/3 \+ 4 = 7/i)).toBeInTheDocument();
  });
});
