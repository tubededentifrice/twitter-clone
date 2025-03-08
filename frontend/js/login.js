// Login form handler

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginAlert = document.getElementById('loginAlert');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Reset previous errors
            resetErrors();
            
            // Get form values
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            // Client-side validation
            let isValid = true;
            
            if (!username) {
                showError('usernameError', 'Username is required');
                isValid = false;
            }
            
            if (!password) {
                showError('passwordError', 'Password is required');
                isValid = false;
            }
            
            if (isValid) {
                try {
                    const response = await fetch('http://localhost:8000/api/users/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            username,
                            password
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        // Store token in localStorage or sessionStorage based on rememberMe
                        if (rememberMe) {
                            localStorage.setItem('token', data.access_token);
                        } else {
                            sessionStorage.setItem('token', data.access_token);
                        }
                        
                        // Store user info
                        localStorage.setItem('user', JSON.stringify({
                            id: data.user_id,
                            username: data.username
                        }));
                        
                        // Show success message and redirect
                        showAlert('Login successful! Redirecting...', 'success');
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 1500);
                    } else {
                        // Handle login errors from server
                        if (data.detail) {
                            showAlert(data.detail, 'danger');
                        } else {
                            showAlert('Login failed. Please check your credentials.', 'danger');
                        }
                    }
                } catch (error) {
                    console.error('Login error:', error);
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
        
        loginAlert.classList.add('d-none');
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
        loginAlert.textContent = message;
        loginAlert.className = `alert alert-${type}`;
        loginAlert.classList.remove('d-none');
    }
});