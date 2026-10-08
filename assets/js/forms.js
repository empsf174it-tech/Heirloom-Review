/*
 * Heirloom Review - Forms Validation
 */

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      let isValid = true;
      const name = document.getElementById('name');
      const email = document.getElementById('email');
      const message = document.getElementById('message');
      
      // Name
      if (name.value.trim() === '') {
        showError(name, 'Name is required');
        isValid = false;
      } else {
        showSuccess(name);
      }
      
      // Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email.value.trim() === '') {
        showError(email, 'Email is required');
        isValid = false;
      } else if (!emailRegex.test(email.value.trim())) {
        showError(email, 'Please enter a valid email address');
        isValid = false;
      } else {
        showSuccess(email);
      }
      
      // Message
      if (message.value.trim() === '') {
        showError(message, 'Message is required');
        isValid = false;
      } else {
        showSuccess(message);
      }
      
      if (isValid) {
        // Simulate Formspree/Netlify submission success
        const successMsg = document.getElementById('form-success');
        successMsg.style.display = 'block';
        contactForm.reset();
        
        // Remove success styling
        [name, email, message].forEach(input => {
          input.classList.remove('success');
        });
        
        setTimeout(() => {
          successMsg.style.display = 'none';
        }, 5000);
      }
    });
  }
  
  function showError(input, message) {
    const formGroup = input.parentElement;
    const msgDiv = formGroup.querySelector('.form-message');
    input.classList.remove('success');
    input.classList.add('error');
    msgDiv.innerText = message;
    msgDiv.classList.remove('success');
    msgDiv.classList.add('error');
  }
  
  function showSuccess(input) {
    const formGroup = input.parentElement;
    const msgDiv = formGroup.querySelector('.form-message');
    input.classList.remove('error');
    input.classList.add('success');
    msgDiv.innerText = '';
    msgDiv.classList.remove('error');
  }
});
