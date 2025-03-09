# Prompt History

This file contains the history of prompts used with Claude Code to develop this Twitter clone project.

## March 9, 2025

### Reorganize Database into Config Directory and Update Docker Configuration

User Prompt:
- Requested to move the database to a "config" folder for better Docker volume mounting
- Asked to fix the volume configurations in Docker files
- Requested to remove backend-only and frontend-only Docker files

Claude:
- Created a new config directory in the backend folder
- Updated database.py to use the new CONFIG_DIR path for database storage
- Modified Docker volume configurations:
  - Changed twitter_db to twitter_config in docker-compose.yml
  - Changed twitter_db_dev to twitter_config_dev in docker-compose-dev.yml
- Updated Dockerfile and Dockerfile.dev to:
  - Create the config directory
  - Set CONFIG_DIR environment variable
- Removed backend/Dockerfile.backend-only and frontend/react-app/Dockerfile.frontend-only
- Updated README.md to reflect the new volume configuration
- Added backend/config/ to .gitignore

## March 9, 2025

### Add Generic Profile Picture

User Prompt:
- Requested to implement a feature to use a generic profile picture when users haven't set one

Claude:
- Implemented a local default avatar image to replace placeholder image URLs
- Created an assets directory in the React frontend to store the default avatar image
- Updated all components to use the local default avatar instead of placeholder URLs
- Modified Profile.js and Tweet.js components to import and use the default avatar
- This change provides a consistent generic profile picture when users haven't set their own

### Update Bootstrap Layout for Full Width

User Prompt:
- "Make sure the bootstrap style uses the whole width of the screen"

Claude:
- Modified App.js to use container-fluid instead of container for full-width layout
- Updated Navbar.js to use Container fluid instead of standard Container
- Changed Home.js to use Container fluid and removed column restrictions
- Updated Login.js and Register.js to use Container fluid and full-width columns
- Modified Profile.js to use Container fluid 
- These changes improve the application's appearance on larger screens and provide more space for content

### Update PROMPT_HISTORY Format

User Prompt:
- "In the PROMPT_HISTORY, ALWAYS indicate the user prompt in addition to what Claude did. Update your instructions accordingly."

Claude:
- Updated PROMPT_HISTORY_003.md format to clearly indicate both user prompts and Claude's actions
- Modified CLAUDE.md instructions to specify the required format for prompt history entries
- Ensured all future prompt history entries will include the exact user request and Claude's response

### Change Frontend Port and Update Docker Configuration

User Prompt:
- "Change the default front end port to 3025. Update the Docker files if necessary since we removed the legacy front end; Make sure the images produced are ready to deploy straight out of the box."

Claude:
- Changed React frontend to use port 3025 in package.json
- Updated docker-compose.yml to split into separate backend and frontend services
- Updated docker-compose-dev.yml to use port 3025 for the frontend service
- Modified docker-publish.sh to build and push both backend and frontend images
- Made docker-publish.sh executable
- Updated run_local.sh to show the correct frontend URL
- Removed references to the single-container approach in Docker configuration
- Made all configurations production-ready

### Make @ Mentions in Tweets Clickable

User Prompt:
- "Make sure @ mentions in tweets are clickable and links to that user's profile"

Claude:
- Modified the Tweet.js component to parse tweet content and identify @ mentions
- Implemented a renderTweetContent function that converts @ mentions to clickable links
- Used React Router's Link component to create profile links for mentioned usernames
- Styled @ mentions as bold blue links to make them visually distinct
- The implementation preserves the original text content while making @ mentions interactive

### Make Backend URL Configurable in Docker

User Prompt:
- "Make the backend URL configurable when running the Docker. The URL can be fqdn or just relative, depending on how we want to expose it (exemple: "https://domain.com/api" or just "/api")."

Claude:
- Modified nginx.conf to use environment variable for backend URL
- Updated Dockerfile and Dockerfile.dev to use a template for nginx configuration
- Created startup.sh script to substitute environment variables in nginx config
- Added BACKEND_URL environment variable to docker-compose and docker-compose-dev files
- Updated README.md with documentation about configuring the backend URL
- The implementation allows specifying a full URL like https://domain.com/api or a relative path like /api

### Fix Docker Nginx Backend Proxy

**User Prompt:** When running the Docker image, the front end is getting 404 errors when accessing the backend

**Claude:** Identified that the nginx configuration was incorrectly proxying requests to the backend. The issue was in the `frontend/react-app/nginx.conf` file where the proxy_pass directive didn't correctly append the `/api` path to the backend URL. Fixed by changing `proxy_pass ${BACKEND_URL};` to `proxy_pass ${BACKEND_URL}/api;`.

### Install envsubst in Docker Image

**User Prompt:** startup.sh calls envsubst but I don't think it's installed on the Docker image, as the default.conf file is empty

**Claude:** Added the gettext-base package to the Dockerfile which provides the envsubst utility. Modified the RUN command that installs nginx and supervisor to also install gettext-base.

### Fix Follow Button API Endpoint Mismatch

**User Prompt:** When clicking on the "Follow" button on the user's profile, I'm getting "Error: Not Found"

**Claude:** Identified a mismatch between the frontend and backend API endpoints for following/unfollowing users. Fixed the issue by:
1. Changed the followUser endpoint in user.service.js from `/profile/${username}/follow` to `/profile/follow/${username}`
2. Changed the unfollowUser endpoint from DELETE `/profile/${username}/follow` to POST `/profile/unfollow/${username}`
These changes align the frontend API calls with the actual backend endpoints defined in profile.py.

### Fix Follow Button State Display

**User Prompt:** The button is still "Follow" on the profile page or people you already follow

**Claude:** Fixed the issue by implementing proper follow status tracking:
1. Added `is_followed` field to the UserProfile Pydantic model
2. Updated the profile endpoint to check if the current user is following the viewed profile
3. Created a new `get_current_user_optional` dependency that doesn't error on unauthenticated requests
4. Modified the auth.py file to support optional authentication
These changes ensure the Follow/Unfollow button correctly displays the current relationship status.

### Fix Missing Import Error for get_current_user_optional

**User Prompt:** Fix this error: uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 [Error shows NameError: name 'get_current_user_optional' is not defined]

**Claude:** Fixed the missing import error in the profile.py router by adding get_current_user_optional to the imports from the auth module. The function was implemented in auth.py but wasn't imported in profile.py where it was being used.

### Fix Follow/Unfollow Button Text Issue

**User Prompt:** When on the user profile of a user I follow, the button is still "Follow" instead of "Unfollow"

**Claude:** Fixed the issue with the follow/unfollow button not displaying correctly:
1. Found that the issue was in how the frontend was handling the `is_followed` value from the backend
2. Modified the Profile component to properly set the `isFollowing` state based on the backend response by using strict equality check
3. Updated the profile image handling in the follower list to handle null values properly