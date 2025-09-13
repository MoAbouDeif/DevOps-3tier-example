// src/__tests__/App.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

describe('App integration', () => {
  afterEach(() => {
    // restore any mocked fetch
    jest.restoreAllMocks();
    delete global.fetch;
  });

  it('renders calculator tab by default and can switch to history', () => {
    render(<App />);

    // Default tab
    expect(screen.getByTestId('calculate-button')).toBeInTheDocument();

    // Switch to History tab
    const historyButton = screen.getByRole('button', { name: /History/i });
    fireEvent.click(historyButton);

    // Check for content in History tab (case-insensitive partial match)
    expect(screen.getByText(/Recent Calculations/i, { exact: false })).toBeInTheDocument();
  });

  it('shows notification after successful calculation', async () => {
    // Mock fetch to return a successful JSON result
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ result: 8 }),
      })
    );

    render(<App />);

    const firstNumberInput = screen.getByTestId('first-number-input');
    const secondNumberInput = screen.getByTestId('second-number-input');
    const operationSelect = screen.getByTestId('operation-select');
    const calculateButton = screen.getByTestId('calculate-button');

    fireEvent.change(firstNumberInput, { target: { value: '5' } });
    fireEvent.change(secondNumberInput, { target: { value: '3' } });
    fireEvent.change(operationSelect, { target: { value: 'add' } });

    fireEvent.click(calculateButton);

    // Wait for the success notification to appear by its text
    const notification = await screen.findByText(/Calculation successful!/i);
    expect(notification).toBeInTheDocument();
    expect(notification).toHaveClass('success');
  });

  it('shows loader overlay when loading', async () => {
    // create a controllable fetch Promise so we can assert loader is visible while pending
    let resolveFetch;
    global.fetch = jest.fn(() => new Promise((res) => { resolveFetch = res; }));

    render(<App />);

    const firstNumberInput = screen.getByTestId('first-number-input');
    const secondNumberInput = screen.getByTestId('second-number-input');
    const operationSelect = screen.getByTestId('operation-select');
    const calculateButton = screen.getByTestId('calculate-button');

    fireEvent.change(firstNumberInput, { target: { value: '2' } });
    fireEvent.change(secondNumberInput, { target: { value: '2' } });
    fireEvent.change(operationSelect, { target: { value: 'multiply' } });

    fireEvent.click(calculateButton);

    // Loader overlay should appear while fetch is pending
    expect(await screen.findByTestId('loader-overlay')).toBeInTheDocument();

    // resolve the fetch (successful)
    resolveFetch({
      ok: true,
      json: () => Promise.resolve({ result: 4 }),
    });

    // loader should eventually disappear
    await waitFor(() => {
      expect(screen.queryByTestId('loader-overlay')).not.toBeInTheDocument();
    });
  });
});
