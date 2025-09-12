// src/__tests__/App.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

describe('App integration', () => {
  let container;

  beforeEach(() => {
    const renderResult = render(<App />);
    container = renderResult.container;
  });

  it('renders calculator tab by default and can switch to history', () => {
    // Default tab
    expect(screen.getByTestId('calculate-button')).toBeInTheDocument();

    // Switch to History tab
    const historyButton = screen.getByRole('button', { name: /History/i });
    fireEvent.click(historyButton);

    // Check for content in History tab
    expect(screen.getByText(/Recent Calculations/i, { exact: false })).toBeInTheDocument();
  });

  it('shows notification after successful calculation', async () => {
    const firstNumberInput = screen.getByTestId('first-number-input');
    const secondNumberInput = screen.getByTestId('second-number-input');
    const operationSelect = screen.getByTestId('operation-select');
    const calculateButton = screen.getByTestId('calculate-button');

    fireEvent.change(firstNumberInput, { target: { value: '5' } });
    fireEvent.change(secondNumberInput, { target: { value: '3' } });
    fireEvent.change(operationSelect, { target: { value: 'add' } });

    fireEvent.click(calculateButton);

    // Wait for the notification to appear (query by class instead of role)
    await waitFor(() =>
      expect(container.querySelector('.notification.success')).toBeInTheDocument()
    );
    expect(container.querySelector('.notification.success')).toHaveTextContent(
      'Calculation successful!'
    );
  });

  it('shows loader overlay when loading', async () => {
    const firstNumberInput = screen.getByTestId('first-number-input');
    const secondNumberInput = screen.getByTestId('second-number-input');
    const operationSelect = screen.getByTestId('operation-select');
    const calculateButton = screen.getByTestId('calculate-button');

    // Mock a loading effect by wrapping setLoading in a Promise
    fireEvent.change(firstNumberInput, { target: { value: '2' } });
    fireEvent.change(secondNumberInput, { target: { value: '2' } });
    fireEvent.change(operationSelect, { target: { value: 'multiply' } });

    fireEvent.click(calculateButton);

    // Loader overlay should appear
    await waitFor(() =>
      expect(container.querySelector('.loader-overlay')).toBeInTheDocument()
    );
  });
});
