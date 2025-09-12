// src/__tests__/CalculatorTab.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CalculatorTab from '../components/CalculatorTab';

describe('CalculatorTab', () => {
  const showNotification = jest.fn();
  const setLoading = jest.fn();

  beforeEach(() => {
    showNotification.mockClear();
    setLoading.mockClear();
  });

  it('renders input fields and calculate button', () => {
    render(<CalculatorTab showNotification={showNotification} setLoading={setLoading} />);

    expect(screen.getByLabelText(/First Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Second Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Operation/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Calculate/i })).toBeInTheDocument();
  });

  it('displays result after calculation', async () => {
    render(<CalculatorTab showNotification={showNotification} setLoading={setLoading} />);

    fireEvent.change(screen.getByLabelText(/First Number/i), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/Second Number/i), { target: { value: '4' } });
    fireEvent.change(screen.getByLabelText(/Operation/i), { target: { value: 'add' } });

    // Mock fetch response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ result: 7 }),
      })
    );

    fireEvent.click(screen.getByRole('button', { name: /Calculate/i }));

    // Use findByText to wait for async result
    expect(await screen.findByText(/Result: 7/i)).toBeInTheDocument();

    global.fetch.mockRestore();
  });

  it('shows error notification on failed calculation', async () => {
    render(<CalculatorTab showNotification={showNotification} setLoading={setLoading} />);

    fireEvent.change(screen.getByLabelText(/First Number/i), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/Second Number/i), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText(/Operation/i), { target: { value: 'divide' } });

    // Mock fetch failure
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Cannot divide by zero' }),
      })
    );

    fireEvent.click(screen.getByRole('button', { name: /Calculate/i }));

    // Wait for notification
    expect(await screen.findByText(/Cannot divide by zero/i)).toBeInTheDocument();

    global.fetch.mockRestore();
  });
});
