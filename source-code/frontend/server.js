const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

// Helper function for operation symbols
function getOperationSymbol(operation) {
  const symbols = {
    'add': '+',
    'subtract': '-',
    'multiply': '×',
    'divide': '÷'
  };
  return symbols[operation] || '';
}

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Make helper function available to all templates
app.locals.getOperationSymbol = getOperationSymbol;

// Routes
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'Calculator',
    theme: 'light',
    result: null,
    calculation: null,
    error: null
  });
});

app.get('/history', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/history?limit=20`);
    res.render('history', {
      title: 'Calculation History',
      theme: 'light',
      history: response.data.history,
      error: req.query.error || null,
      message: req.query.message || null
    });
  } catch (error) {
    res.render('history', {
      title: 'Calculation History',
      theme: 'light',
      history: [],
      error: 'Failed to fetch history',
      message: null
    });
  }
});

app.post('/calculate', async (req, res) => {
  try {
    const { a, b, operation } = req.body;
    const response = await axios.post(`${API_BASE_URL}/calculate`, {
      a: parseFloat(a),
      b: parseFloat(b),
      operation
    });
    
    res.render('index', {
      title: 'Calculator',
      theme: 'light',
      result: response.data.result,
      calculation: { a, b, operation, id: response.data.id },
      error: null
    });
  } catch (error) {
    let errorMessage = 'An error occurred during calculation';
    if (error.response && error.response.data && error.response.data.error) {
      errorMessage = error.response.data.error;
    }
    
    res.render('index', {
      title: 'Calculator',
      theme: 'light',
      result: null,
      calculation: req.body,
      error: errorMessage
    });
  }
});

app.post('/calculation/:id/delete', async (req, res) => {
  try {
    const calculationId = req.params.id;
    const response = await axios.delete(`${API_BASE_URL}/calculation/${calculationId}`);
    
    if (response.status === 200) {
      res.redirect('/history?message=Calculation deleted successfully');
    } else {
      res.redirect('/history?error=Failed to delete calculation');
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.redirect('/history?error=Failed to delete calculation');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Frontend server running on http://localhost:${PORT}`);
  console.log(`API base URL: ${API_BASE_URL}`);
});