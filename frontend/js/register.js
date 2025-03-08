// Registration form handler

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const registerAlert = document.getElementById('registerAlert');
    
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Reset previous errors
            resetErrors();
            
            // Get form values
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Client-side validation
            let isValid = true;
            
            if (!username) {
                showError('usernameError', 'Username is required');
                isValid = false;
            }
            
            if (!email) {
                showError('emailError', 'Email is required');
                isValid = false;
            } else if (!isValidEmail(email)) {
                showError('emailError', 'Please enter a valid email address');
                isValid = false;
            }
            
            if (!password) {
                showError('passwordError', 'Password is required');
                isValid = false;
            } else if (password.length < 6) {
                showError('passwordError', 'Password must be at least 6 characters');
                isValid = false;
            }
            
            if (password !== confirmPassword) {
                showError('confirmPasswordError', 'Passwords do not match');
                isValid = false;
            }
            
            if (isValid) {
                try {
                    const response = await fetch('http://localhost:8000/api/users/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            username,
                            email,
                            password
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        // Show success message
                        showAlert('Registration successful! You can now log in.', 'success');
                        registerForm.reset();
                    } else {
                        // Handle validation errors from server
                        if (data.detail) {
                            if (typeof data.detail === 'string') {
                                showAlert(data.detail, 'danger');
                            } else if (Array.isArray(data.detail)) {
                                data.detail.forEach(error => {
                                    const field = error.loc[1];
                                    const message = error.msg;
                                    
                                    if (field === 'username') {
                                        showError('usernameError', message);
                                    } else if (field === 'email') {
                                        showError('emailError', message);
                                    } else if (field === 'password') {
                                        showError('passwordError', message);
                                    } else {
                                        showAlert(message, 'danger');
                                    }
                                });
                            }
                        } else {
                            showAlert('An error occurred during registration. Please try again.', 'danger');
                        }
                    }
                } catch (error) {
                    console.error('Registration error:', error);
                    showAlert('Unable to connect to the server. Please try again later.', 'danger');
                }
            }
        });
    }
    
    // Helper functions
    function resetErrors() {
        document.querySelectorAll('.invalid-feedback').forEach(el => {
            el.textContent = '';
        });
        
        document.querySelectorAll('.form-control').forEach(el => {
            el.classList.remove('is-invalid');
        });
        
        registerAlert.classList.add('d-none');
    }
    
    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            
            // Add is-invalid class to the input
            const inputId = elementId.replace('Error', '');
            const inputElement = document.getElementById(inputId);
            if (inputElement) {
                inputElement.classList.add('is-invalid');
            }
        }
    }
    
    function showAlert(message, type) {
        registerAlert.textContent = message;
        registerAlert.className = `alert alert-${type}`;
        registerAlert.classList.remove('d-none');
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
});