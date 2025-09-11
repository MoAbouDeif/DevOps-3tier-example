document.addEventListener('DOMContentLoaded', function() {
  // Initialize theme based on user preference or system setting
  initializeTheme();
  
  // Set up all event listeners
  setupEventListeners();
  
  // Initialize UI enhancements
  initializeUIEnhancements();
});

function initializeTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Set initial theme
  let currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
      const newTheme = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      updateThemeIcon(newTheme);
    }
  });
  
  // Theme toggle event
  themeToggle.addEventListener('click', function() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    
    showToast(`Switched to ${newTheme} mode`);
  });
}

function updateThemeIcon(theme) {
  const themeToggle = document.getElementById('themeToggle');
  const icon = themeToggle.querySelector('i');
  
  if (theme === 'dark') {
    icon.className = 'fas fa-sun';
    themeToggle.setAttribute('aria-label', 'Switch to light mode');
  } else {
    icon.className = 'fas fa-moon';
    themeToggle.setAttribute('aria-label', 'Switch to dark mode');
  }
}

function setupEventListeners() {
  setupOperationButtons();
  setupCalculatorForm();
  setupDeleteButtons();
  setupKeyboardShortcuts();
}

function setupOperationButtons() {
  const operationButtons = document.querySelectorAll('.operation-btn');
  const operationInput = document.getElementById('operation');
  
  operationButtons.forEach(button => {
    button.addEventListener('click', function() {
      operationButtons.forEach(btn => btn.classList.remove('selected'));
      this.classList.add('selected');
      operationInput.value = this.dataset.operation;
      
      // Visual feedback
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = '';
      }, 100);
    });
  });
}

function setupCalculatorForm() {
  const calculatorForm = document.getElementById('calculatorForm');
  if (!calculatorForm) return;
  
  calculatorForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const a = parseFloat(document.getElementById('a').value);
    const b = parseFloat(document.getElementById('b').value);
    const operation = document.getElementById('operation').value;
    
    if (isNaN(a) || isNaN(b) || !operation) {
      showError('Please provide valid numbers and select an operation');
      return;
    }
    
    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
    submitBtn.disabled = true;
    
    this.submit();
  });
}

function setupDeleteButtons() {
  document.addEventListener('click', function(e) {
    if (e.target.closest('.delete-btn')) {
      e.preventDefault();
      const form = e.target.closest('.delete-form');
      confirmDelete(form);
    }
  });
}

function confirmDelete(form) {
  const confirmation = confirm('Are you sure you want to delete this calculation? This action cannot be undone.');
  if (confirmation) {
    const button = form.querySelector('.delete-btn');
    const originalHTML = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    button.disabled = true;
    
    form.submit();
  }
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + D to toggle theme
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault();
      document.getElementById('themeToggle').click();
    }
    
    // Escape to clear form
    if (e.key === 'Escape') {
      clearCalculatorForm();
    }
    
    // Number keys to select operations
    if (e.key >= '1' && e.key <= '4') {
      const operations = ['add', 'subtract', 'multiply', 'divide'];
      const operation = operations[parseInt(e.key) - 1];
      selectOperation(operation);
    }
  });
}

function clearCalculatorForm() {
  const calculatorForm = document.getElementById('calculatorForm');
  if (calculatorForm) {
    calculatorForm.reset();
    document.querySelectorAll('.operation-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    document.getElementById('operation').value = '';
    
    const resultContainer = document.querySelector('.result-card');
    if (resultContainer) {
      resultContainer.remove();
    }
    
    showToast('Form cleared');
  }
}

function selectOperation(operation) {
  const button = document.querySelector(`.operation-btn[data-operation="${operation}"]`);
  if (button) {
    button.click();
  }
}

function showError(message) {
  const existingError = document.querySelector('.alert-danger');
  if (existingError) {
    existingError.remove();
  }
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'alert alert-danger alert-dismissible fade show';
  errorDiv.innerHTML = `
    <i class="fas fa-exclamation-circle me-2"></i>
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  const calculatorForm = document.getElementById('calculatorForm');
  if (calculatorForm) {
    calculatorForm.prepend(errorDiv);
  } else {
    document.querySelector('.container').prepend(errorDiv);
  }
  
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.remove();
    }
  }, 5000);
}

function showToast(message) {
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast-content">
      <i class="fas fa-check-circle me-2"></i>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }, 3000);
}

function initializeUIEnhancements() {
  // Auto-hide alerts after 5 seconds
  setTimeout(() => {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
      setTimeout(() => {
        alert.remove();
      }, 5000);
    });
  }, 5000);
}