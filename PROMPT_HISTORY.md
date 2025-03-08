# Prompt History

This file contains the history of prompts used with Claude Code to develop this Twitter clone project.

## March 8, 2025

### Initial Setup
> Initialize this new repository. We will be making a Python web application, with the frontend based off the Bootstrap. Use the web framework you feel best suited. Initialize CLAUDE.md and README.md with all the relevant information, and always keep them up to date. The application will be a Twitter clone. Create a script to start the service locally for testing. For now, only create an empty home page "Hello world". Feel free to split the frontend and the backend if you deem appropriate.

Claude set up:
- FastAPI backend with basic structure
- Bootstrap frontend with simple homepage
- Project documentation (README.md, CLAUDE.md)
- Local development script (run_local.sh)

### Prompt History Tracking
> Keep the whole prompt history in PROMPT_HISTORY.md; Add that instruction to CLAUDE.md

Claude added PROMPT_HISTORY.md and updated CLAUDE.md with instructions to maintain the prompt history.

### Improved .gitignore
> Generate a relevant .gitignore file for the current tech stack

Claude updated the .gitignore file with comprehensive patterns for:
- Python testing and coverage files
- Virtual environment variations
- Additional database file types
- OS-specific files
- IDE configurations
- Logs and local development files
- Deployment-related files

### Conversation Compaction
> Use the /compact command to summarize older conversation history while preserving recent messages.

Claude compacted the conversation history.

### Enforce Linux Line Endings
> Make sure to always use Linux line ending and persist this instruction

Claude updated CLAUDE.md to specify that all files should use Linux line endings (LF).

### Fix Development Script
> Launch the dev environment; fix the script appropriately

Claude:
- Updated run_local.sh to check for Rust/Cargo (required for pydantic)
- Added pip upgrade step before installing requirements
- Ensured script uses Linux line endings
- Set proper executable permissions

### Running Local Server
> Run the server locally and fix any error

Claude:
- Added missing `__init__.py` files in app directory structure
- Created necessary directory structure for backend modules
- Updated Pydantic schema to use `from_attributes = True` instead of deprecated `orm_mode`
- Downgraded package versions to more stable releases to avoid compilation issues
- Modified run_local.sh to work without requiring Rust/Cargo installation
- Added email-validator package to requirements.txt

### Registration Form
> Create the registration form for the web application. Keep it trivial for now, only ask for login, password and email; Do not actually send any email for validation, but check for unicity and syntax

Claude:
- Created a new registration page (register.html) with Bootstrap styling
- Added JavaScript form validation (register.js) with client-side checks
- Implemented backend user registration API endpoint
- Added password hashing with bcrypt
- Added username and email uniqueness validation
- Created proper form error handling and feedback

### Update Dependencies
> Update all dependencies to their latest versions

Claude:
- Updated all Python packages in requirements.txt to their latest versions

### Login Form
> Create the login form for the app. Make sure to follow all instructions in CLAUDE.md

Claude:
- Created login form page (login.html) with Bootstrap styling
- Implemented login form validation with JavaScript (login.js)
- Added backend login endpoint with JWT token authentication
- Implemented token-based authentication system
- Added "Remember me" functionality that determines token storage location
- Updated existing pages to link to the login page
- Enhanced app.js with authentication state management and UI updates

### Tweet Functionality
> After logging, the home page should contain a box to allow for posting a new tweet. Tweets are limited to 256 characters

Claude:
- Created a Tweet model in the database with a 256 character limit
- Implemented backend API endpoints for creating and retrieving tweets
- Added user-tweet relationship in the database model
- Created a tweet posting form on the homepage (visible only when logged in)
- Added character counter with visual feedback as users approach the limit
- Implemented tweet submission with proper authentication
- Added a tweet feed that displays all tweets in reverse chronological order
- Enhanced the UI to show/hide tweet functionality based on login status
- Added proper error handling and loading states