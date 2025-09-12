// src/__tests__/HistoryTab.test.js
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import HistoryTab from '../components/HistoryTab';

describe('HistoryTab', () => {
  const showNotification = jest.fn();
  const setLoading = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            history: [
              {
                id: 1,
                a: 3,
                b: 4,
                operation: 'add',
                result: 7,
                created_at: new Date().toISOString(),
              },
            ],
          }),
      })
    );
  });

  it('renders history list from API', async () => {
    render(<HistoryTab showNotification={showNotification} setLoading={setLoading} />);

    // Custom matcher to check full text content (handles <strong> element)
    await waitFor(() => {
      expect(
        screen.getByText((content, element) =>
          element.textContent.replace(/\s+/g, ' ').trim() === '3 + 4 = 7'
        )
      ).toBeInTheDocument();
    });
  });

  it('refresh button triggers fetch', async () => {
    render(<HistoryTab showNotification={showNotification} setLoading={setLoading} />);

    const refreshButton = screen.getByTestId('refresh-button');
    fireEvent.click(refreshButton);

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2)); // initial fetch + refresh
  });
});
