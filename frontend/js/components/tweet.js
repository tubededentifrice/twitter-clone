/**
 * Tweet Component for Twitter Clone
 * A reusable component to display tweets consistently across the application
 */

/**
 * Create a tweet element from tweet data
 * @param {Object} tweet - The tweet data object
 * @param {boolean} showAuthor - Whether to show author information (default: true)
 * @returns {HTMLElement} The tweet DOM element
 */
function createTweetElement(tweet, showAuthor = true) {
    const tweetElement = document.createElement('div');
    tweetElement.className = 'card mb-3 tweet-card';
    tweetElement.setAttribute('data-tweet-id', tweet.id);
    
    // Inner content
    let authorHTML = '';
    if (showAuthor) {
        authorHTML = `
            <h6 class="card-subtitle mb-2 text-primary">
                <a href="profile.html?username=${tweet.author_username}" class="text-primary text-decoration-none">@${tweet.author_username}</a>
            </h6>
        `;
    }
    
    tweetElement.innerHTML = `
        <div class="card-body">
            ${authorHTML}
            <p class="card-text">${tweet.content}</p>
            <small class="text-muted">${formatTweetDate(new Date(tweet.created_at))}</small>
        </div>
    `;
    
    return tweetElement;
}

/**
 * Format a date for tweet display
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
function formatTweetDate(date) {
    // Check if the date is today
    const today = new Date();
    const isToday = date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear();
    
    if (isToday) {
        // For today, show time only
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
        // For other days, show date and time
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}

/**
 * Render a list of tweets into a container
 * @param {Array} tweets - Array of tweet objects
 * @param {HTMLElement} container - The container element to render tweets into
 * @param {boolean} showAuthor - Whether to show tweet authors
 */
function renderTweets(tweets, container, showAuthor = true) {
    if (!container) {
        console.error('Tweet container element not found');
        return;
    }
    
    // Clear container
    container.innerHTML = '';
    
    if (tweets.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <p class="text-muted">No tweets to display</p>
            </div>
        `;
        return;
    }
    
    // Render each tweet
    tweets.forEach(tweet => {
        const tweetElement = createTweetElement(tweet, showAuthor);
        container.appendChild(tweetElement);
    });
}

/**
 * Show loading indicator in a container
 * @param {HTMLElement} container - The container element
 */
function showTweetLoadingIndicator(container) {
    if (!container) return;
    
    container.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
}

/**
 * Show error message in a container
 * @param {HTMLElement} container - The container element
 * @param {string} message - The error message to display
 */
function showTweetError(container, message = 'Failed to load tweets. Please try again later.') {
    if (!container) return;
    
    container.innerHTML = `
        <div class="alert alert-danger m-3">
            ${message}
        </div>
    `;
}