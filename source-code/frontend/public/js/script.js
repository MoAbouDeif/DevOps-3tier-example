document.addEventListener('DOMContentLoaded', function() {
  // Operation buttons selection
  const operationButtons = document.querySelectorAll('.operation-btn');
  const operationInput = document.getElementById('operation');
  
  operationButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove selected class from all buttons
      operationButtons.forEach(btn => btn.classList.remove('selected'));
      
      // Add selected class to clicked button
      this.classList.add('selected');
      
      // Set the operation value
      operationInput.value = this.dataset.operation;
      
      // Visual feedback
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = '';
      }, 100);
    });
  });

  // Calculator form validation and submission
  const calculatorForm = document.getElementById('calculatorForm');
  if (calculatorForm) {
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
      
      // Submit form
      this.submit();
    });
  }

  // Delete buttons with confirmation
  const deleteForms = document.querySelectorAll('.delete-form');
  deleteForms.forEach(form => {
    form.addEventListener('submit', function(e) {
      if (!confirm('Are you sure you want to delete this calculation?')) {
        e.preventDefault();
      }
    });
  });

  // Auto-hide alerts after 5 seconds
  setTimeout(() => {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
      alert.style.opacity = '0';
      setTimeout(() => {
        alert.remove();
      }, 300);
    });
  }, 5000);
});

// Show error message
function showError(message) {
  // Remove any existing error
  const existingError = document.querySelector('.alert-danger');
  if (existingError) {
    existingError.remove();
  }
  
  // Create error element
  const errorDiv = document.createElement('div');
  errorDiv.className = 'alert alert-danger alert-dismissible fade show';
  errorDiv.innerHTML = `
    <i class="fas fa-exclamation-circle me-2"></i>
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  // Insert error at the top of the form
  const calculatorForm = document.getElementById('calculatorForm');
  if (calculatorForm) {
    calculatorForm.prepend(errorDiv);
  } else {
    // Insert at the top of the page if no form found
    document.querySelector('.container').prepend(errorDiv);
  }
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.remove();
    }
  }, 5000);
}