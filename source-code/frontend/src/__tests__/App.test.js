// src/__tests__/App.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

describe('App integration', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('renders calculator tab by default and can switch to history', () => {
    render(<App />);
    expect(screen.getByTestId('calculate-button')).toBeInTheDocument();

    fireEvent.click(screen.getByText(/History/i));
    expect(screen.getByText(/Recent Calculations/i)).toBeInTheDocument();
  });

  it('shows notification after successful calculation', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, result: 8 }),
    });

    render(<App />);

    fireEvent.change(screen.getByTestId('first-number-input'), { target: { value: '4' } });
    fireEvent.change(screen.getByTestId('second-number-input'), { target: { value: '4' } });
    fireEvent.click(screen.getByTestId('calculate-button'));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert')).toHaveTextContent('Calculation successful!');
  });

  it('shows loader overlay when loading', async () => {
    // create a fetch that resolves after a tick
    let resolveFetch;
    const fetchPromise = new Promise((res) => {
      resolveFetch = res;
    });
    jest.spyOn(global, 'fetch').mockImplementation(() => fetchPromise);

    const { container } = render(<App />);

    fireEvent.change(screen.getByTestId('first-number-input'), { target: { value: '1' } });
    fireEvent.change(screen.getByTestId('second-number-input'), { target: { value: '2' } });
    fireEvent.click(screen.getByTestId('calculate-button'));

    // loader should appear immediately
    expect(container.querySelector('[data-testid="loader-overlay"]')).toBeInTheDocument();

    // resolve fetch and let UI update
    await act(async () => {
      resolveFetch({ ok: true, json: async () => ({ id: 1, result: 3 }) });
    });

    // loader should disappear after fetch finishes
    await waitFor(() => {
      expect(container.querySelector('[data-testid="loader-overlay"]')).not.toBeInTheDocument();
    });
  });
});
