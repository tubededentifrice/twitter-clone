// Main JavaScript for Twitter Clone

document.addEventListener('DOMContentLoaded', function() {
    console.log('Twitter Clone app initialized');
    
    // Check if API is available
    fetch('http://localhost:8000/api/health')
        .then(response => response.json())
        .then(data => {
            console.log('API Status:', data);
        })
        .catch(error => {
            console.error('API Error:', error);
        });
});