# Prompt History

This file contains the history of prompts used with Claude Code to develop this Twitter clone project.

## March 8, 2025

### Create Reusable Tweet Component
> Refactor the tweets into a reusable component; make sure to always reuse the same component everywhere tweets are displayed, for consistency, so at least both on the home page and on the profile pages

Claude:
- Created a new reusable tweet component in `/frontend/js/components/tweet.js`
- Implemented standardized tweet rendering across the application
- Created helper functions for showing loading states and error messages
- Moved tweet date formatting to the shared component
- Updated both home page and profile page to use the new component
- Added support for conditional author display (showing on home, hiding on profile)
- Added the component script to both index.html and profile.html

### Fix Inconsistent Tweet Display
> Make sure the tweets looks exactly the same everywhere they are displayed. Right now on the profiles pages it's missing the user name

Claude:
- Modified `profile.js` to always show tweet author information for consistency
- Updated `renderTweets()` call to set `showAuthor` parameter to `true` on profile pages
- Ensured consistent tweet display format across all pages

### Fix Followers List Not Updating
> When on somebody's page, the list of followers isn't updating

Claude:
- Identified the bug in profile.js where followers list wasn't showing for other users' profiles
- Created a new backend endpoint to get followers for any user: `/{username}/followers`
- Implemented a new frontend function `loadUserFollowers()` to fetch and display any user's followers
- Updated the UI to show other users' followers list instead of a placeholder message
- Modified follow/unfollow functions to refresh the followers list in real-time when changes occur

### Fix Following List Not Updating
> The list of users a user follows isn't updating, when on somebody else's page

Claude:
- Created a new backend endpoint `GET /{username}/following` to fetch users that a specific user is following
- Implemented `loadUserFollowing()` function in the frontend to display any user's following list
- Updated profile.js to call this new function when viewing another user's profile
- Modified the follow/unfollow functions to refresh both followers and following lists
- Replaced the placeholder message with actual following list data for other users' profiles

### React Frontend
> Refactor the frontend to use React

Claude:
- Created a complete React frontend application structure
- Set up modern React with functional components and hooks
- Implemented all features from the original frontend:
  - Authentication (login/register)
  - Tweet timeline with posting functionality
  - User profiles with follow/unfollow capabilities
  - Profile picture upload
  - Followers/following management
- Organized code with proper separation of concerns:
  - API services for backend communication
  - Reusable UI components
  - Page components for different routes
- Used React Router for client-side routing
- Implemented proper form validation and error handling
- Added loading states and user feedback
- Preserved the original Bootstrap-based design using React Bootstrap
- Updated run_local.sh to support both React and legacy frontends
- Updated documentation (README.md, CLAUDE.md) to reflect the new React frontend

### Implement Backend Unit Tests
> Implement unit testing for the backend; create a script to run those tests

Claude:
- Created comprehensive unit tests for all major backend components:
  - User registration and authentication (test_user.py)
  - Tweet creation and retrieval (test_tweet.py)
  - Profile management and follow/unfollow functionality (test_profile.py)
  - Authentication utilities and token management (test_auth.py)
- Implemented shared testing utilities in conftest.py
  - Test database configuration with SQLite in-memory database
  - Fixtures for test data creation and cleanup
  - Helper functions for test user creation
- Created extensive test cases covering:
  - Success scenarios for all endpoints
  - Error handling and edge cases
  - Authentication and authorization validation
  - Data validation and business rule enforcement
- Added a run_tests.sh script for easy test execution
  - Automatic virtual environment management
  - Dependencies installation
  - Test execution with coverage reporting
  - Support for targeted test execution
  - Color-coded output for improved readability
- Updated requirements.txt to include pytest-cov for coverage reporting

### Docker Configuration
> Generate Docker and docker-compose files, as well as everything necessary to publish the image to Docker hub as "tubededentifrice/twitter-clone". Make sure both the frontend and the backend are in a single image, with the database and user's uploads on a volume

Claude:
- Created a multi-stage Dockerfile that:
  - Builds the React frontend in the first stage
  - Packages the FastAPI backend and frontend build in the final image
  - Sets up proper environment variables and working directories
- Created docker-compose.yml for production deployment:
  - Configures the single "tubededentifrice/twitter-clone" service
  - Sets up volumes for database and uploads persistence
  - Maps port 8000 for the application
- Created separate Docker files for development:
  - Dockerfile.backend-only and Dockerfile.frontend-only
  - docker-compose-dev.yml with separate services for easier development
- Created a docker-publish.sh script for easy image publishing:
  - Handles building, tagging, and pushing to Docker Hub
  - Supports version tagging with command line arguments
- Modified the backend to serve the frontend in Docker:
  - Added code to serve React static files when running in a container
  - Updated CORS settings for containerized environment
  - Added environment variable support for uploads directory
- Added Docker-related documentation:
  - Updated README.md with Docker deployment instructions
  - Created .env.example for environment variable configuration
  - Added entries to PROMPT_HISTORY_002.md# Update PROMPT_HISTORY_002.md

## March 9, 2025

### Compilation Errors

Claude:
- Fixed React compilation errors: installed missing date-fns dependency and fixed useEffect hook dependency issue in Profile.js component

### Fix Login and Profile Component Issues

Claude:
- Fixed login endpoint in auth.service.js: changed from incorrect `/api/token` to correct `/api/users/login`
- Fixed reference error in Profile.js component: resolved "Cannot access 'fetchProfileData' before initialization" by properly ordering function definition before its use in useEffect

### Fix Registration Endpoint

Claude:
- Fixed registration endpoint in auth.service.js: changed from incorrect `/api/user/` to correct `/api/users/register`
- This fixes 404 error when trying to register new users in the React frontend

### Remove Legacy Frontend

Claude:
- Removed the old Bootstrap-based frontend (HTML, CSS, and JS files)
- Kept only the React frontend in frontend/react-app/
- Updated CLAUDE.md to remove references to the legacy frontend
- Updated run_local.sh script to only start the React frontend
- The legacy code was backed up to /tmp/twitter-clone-legacy-backup/ before removal

### Fix Tweet Display and Timezone Issues

Claude:
- Fixed missing username in tweets on profile pages by ensuring username is consistently available
- Fixed timezone display issues in tweets by properly parsing dates with parseISO from date-fns
- Updated Tweet component to handle both author_username (from backend) and username (for compatibility)
- Ensured profile pages correctly pass profile image data to tweets for consistent display
- These changes ensure tweets display consistently across all pages with correct username and timestamps

### Add Generic Profile Picture

Claude:
- Implemented a local default avatar image to replace placeholder image URLs
- Created an assets directory in the React frontend to store the default avatar image
- Updated all components to use the local default avatar instead of placeholder URLs
- Modified Profile.js and Tweet.js components to import and use the default avatar
- This change provides a consistent generic profile picture when users haven't set their own

