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
    
    // Check authentication state and update UI
    updateAuthUI();
    
    // Setup tweet UI elements if on home page
    setupTweetUI();
    
    // Load tweets if on home page
    if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
        loadTweets();
    }
    
    // Show/hide elements based on login status
    const loggedInItems = document.querySelectorAll('.logged-in-nav-item');
    const loggedOutItems = document.querySelectorAll('.logged-out-nav-item');
    const userItems = document.querySelectorAll('.user-nav-item');
    
    if (isLoggedIn()) {
        loggedInItems.forEach(item => item.classList.remove('d-none'));
        loggedOutItems.forEach(item => item.classList.add('d-none'));
        userItems.forEach(item => item.classList.remove('d-none'));
    } else {
        loggedInItems.forEach(item => item.classList.add('d-none'));
        loggedOutItems.forEach(item => item.classList.remove('d-none'));
        userItems.forEach(item => item.classList.add('d-none'));
    }
    
    // Setup logout link
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});

// Authentication helper functions
function isLoggedIn() {
    return !!getToken();
}

function getToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
}

function getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

function logout() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

function updateAuthUI() {
    const navbarNav = document.getElementById('navbarNav');
    const userInfo = getUser();
    
    if (navbarNav && isLoggedIn() && userInfo) {
        // Get the navbar links container
        const navLinksContainer = navbarNav.querySelector('.navbar-nav');
        
        // Clear existing authentication links
        const authLinks = navLinksContainer.querySelectorAll('.nav-item:not(:first-child)');
        authLinks.forEach(link => link.remove());
        
        // Add authenticated user links
        const userDropdown = document.createElement('li');
        userDropdown.className = 'nav-item dropdown';
        userDropdown.innerHTML = `
            <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
                ${userInfo.username}
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="profile.html">Profile</a></li>
                <li><a class="dropdown-item" href="#">Settings</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" id="logoutBtn">Logout</a></li>
            </ul>
        `;
        
        navLinksContainer.appendChild(userDropdown);
        
        // Add event listener to logout button
        document.getElementById('logoutBtn').addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

// Tweet Functions
function setupTweetUI() {
    const tweetFormContainer = document.getElementById('tweetFormContainer');
    const loginPrompt = document.getElementById('loginPrompt');
    const tweetForm = document.getElementById('tweetForm');
    const tweetContent = document.getElementById('tweetContent');
    const charCount = document.getElementById('charCount');
    
    if (!tweetFormContainer || !loginPrompt) {
        // Not on a page with tweet functionality
        return;
    }
    
    // Show appropriate UI based on login state
    if (isLoggedIn()) {
        tweetFormContainer.classList.remove('d-none');
        loginPrompt.classList.add('d-none');
    } else {
        tweetFormContainer.classList.add('d-none');
        loginPrompt.classList.remove('d-none');
    }
    
    // Setup character counter
    if (tweetContent && charCount) {
        tweetContent.addEventListener('input', function() {
            const remainingChars = this.value.length;
            charCount.textContent = `${remainingChars}/256 characters`;
            
            // Visual feedback as user approaches limit
            if (remainingChars > 230) {
                charCount.classList.remove('text-muted');
                charCount.classList.add('text-danger');
            } else {
                charCount.classList.add('text-muted');
                charCount.classList.remove('text-danger');
            }
        });
    }
    
    // Setup tweet form submission
    if (tweetForm) {
        tweetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const content = tweetContent.value.trim();
            if (!content) {
                alert('Please enter tweet content');
                return;
            }
            
            submitTweet(content);
        });
    }
}

function submitTweet(content) {
    const token = getToken();
    
    if (!token) {
        alert('You must be logged in to post a tweet');
        return;
    }
    
    // Disable the form while submitting
    const submitBtn = document.querySelector('#tweetForm button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Posting...';
    
    fetch('http://localhost:8000/api/tweets/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to post tweet');
        }
        return response.json();
    })
    .then(data => {
        console.log('Tweet posted:', data);
        
        // Clear the form
        document.getElementById('tweetContent').value = '';
        document.getElementById('charCount').textContent = '0/256 characters';
        
        // Reload tweets to show the new one
        loadTweets();
    })
    .catch(error => {
        console.error('Error posting tweet:', error);
        alert('Error posting tweet. Please try again.');
    })
    .finally(() => {
        // Re-enable the form
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    });
}

function loadTweets() {
    const tweetsContainer = document.getElementById('tweetsContainer');
    
    if (!tweetsContainer) {
        // Not on a page with tweets display
        return;
    }
    
    // Show loading indicator
    showTweetLoadingIndicator(tweetsContainer);
    
    fetch('http://localhost:8000/api/tweets/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch tweets');
            }
            return response.json();
        })
        .then(tweets => {
            if (tweets.length === 0) {
                tweetsContainer.innerHTML = `
                    <div class="text-center py-5">
                        <p class="text-muted">No tweets yet. Be the first to tweet!</p>
                    </div>
                `;
                return;
            }
            
            // Display tweets using the component
            renderTweets(tweets, tweetsContainer, true);
        })
        .catch(error => {
            console.error('Error loading tweets:', error);
            showTweetError(tweetsContainer);
        });
}