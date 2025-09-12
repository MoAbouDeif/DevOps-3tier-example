// src/App.test.js
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock the components to isolate App testing
jest.mock('./components/CalculatorTab', () => {
  const CalculatorTab = () => <div>Calculator Tab</div>;
  CalculatorTab.displayName = 'CalculatorTab';
  return CalculatorTab;
});

jest.mock('./components/HistoryTab', () => {
  const HistoryTab = () => <div>History Tab</div>;
  HistoryTab.displayName = 'HistoryTab';
  return HistoryTab;
});

test('renders calculator title', () => {
  render(<App />);
  // Look for either "Smart Calculator" or "Simple Calculator"
  const titleElement = screen.getByText(/(Smart|Simple) Calculator/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders subtitle', () => {
  render(<App />);
  const subtitleElement = screen.getByText(/Perform calculations and track your history/i);
  expect(subtitleElement).toBeInTheDocument();
});

test('renders calculator tab by default', () => {
  render(<App />);
  const calculatorTab = screen.getByText(/Calculator Tab/i);
  expect(calculatorTab).toBeInTheDocument();
});

test('switches to history tab when clicked', async () => {
  render(<App />);
  
  // Use a more specific selector to avoid text conflicts
  const historyTabButton = screen.getByRole('button', { name: /history/i });
  
  // Click the history tab
  userEvent.click(historyTabButton);
  
  // Wait for the tab to switch
  await waitFor(() => {
    const historyTab = screen.getByText(/History Tab/i);
    expect(historyTab).toBeInTheDocument();
  });
});