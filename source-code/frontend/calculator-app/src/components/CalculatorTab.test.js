// src/components/CalculatorTab.test.js
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CalculatorTab from './CalculatorTab';

// Mock the fetch function
global.fetch = jest.fn();

describe('CalculatorTab', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders calculator form', () => {
    render(<CalculatorTab showNotification={jest.fn()} setLoading={jest.fn()} />);
    
    expect(screen.getByLabelText(/First Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Operation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Second Number/i)).toBeInTheDocument();
    expect(screen.getByText(/Calculate/i)).toBeInTheDocument();
  });

  test('shows validation errors for empty inputs', async () => {
    render(<CalculatorTab showNotification={jest.fn()} setLoading={jest.fn()} />);
    
    const calculateButton = screen.getByTestId('calculate-button');
    await userEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-a')).toHaveTextContent('First number is required');
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('error-b')).toHaveTextContent('Second number is required');
    });
  });

  test('shows validation error for non-numeric inputs', async () => {
    render(<CalculatorTab showNotification={jest.fn()} setLoading={jest.fn()} />);
    
    const firstInput = screen.getByTestId('first-number-input');
    const secondInput = screen.getByTestId('second-number-input');
    const calculateButton = screen.getByTestId('calculate-button');
    
    // Use fireEvent.change instead of userEvent.type for more reliable input simulation
    fireEvent.change(firstInput, { target: { value: 'abc' } });
    fireEvent.change(secondInput, { target: { value: 'xyz' } });
    await userEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-a')).toHaveTextContent('Must be a valid number');
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('error-b')).toHaveTextContent('Must be a valid number');
    });
  });

  test('submits form with valid data', async () => {
    const mockShowNotification = jest.fn();
    const mockSetLoading = jest.fn();
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ result: 5, id: '123' }),
    });
    
    render(<CalculatorTab showNotification={mockShowNotification} setLoading={mockSetLoading} />);
    
    const firstInput = screen.getByTestId('first-number-input');
    const secondInput = screen.getByTestId('second-number-input');
    const calculateButton = screen.getByTestId('calculate-button');
    
    fireEvent.change(firstInput, { target: { value: '2' } });
    fireEvent.change(secondInput, { target: { value: '3' } });
    await userEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          a: 2,
          b: 3,
          operation: 'add'
        })
      });
    });
  });

  test('shows validation error for division by zero', async () => {
    render(<CalculatorTab showNotification={jest.fn()} setLoading={jest.fn()} />);
    
    const firstInput = screen.getByTestId('first-number-input');
    const secondInput = screen.getByTestId('second-number-input');
    const operationSelect = screen.getByTestId('operation-select');
    const calculateButton = screen.getByTestId('calculate-button');
    
    fireEvent.change(firstInput, { target: { value: '5' } });
    fireEvent.change(secondInput, { target: { value: '0' } });
    fireEvent.change(operationSelect, { target: { value: 'divide' } });
    await userEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-b')).toHaveTextContent('Cannot divide by zero');
    });
  });
});