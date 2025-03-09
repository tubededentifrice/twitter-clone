# Prompt History

This file contains the history of prompts used with Claude Code to develop this Twitter clone project.

## March 9, 2025

### Remove User Private Details from Profile Endpoints

**User Prompt:** When fetching a user profile, make sure it doesn't include the user private details (it's email and password)

**Claude:**
- Created a new UserPublic Pydantic model without email field
- Modified UserProfile to inherit from UserPublic instead of User
- Removed email from the response in /api/profile/me endpoint
- Removed email from the response in /api/profile/{username} endpoint
- Ensured password hashes were never exposed in any endpoint
- These changes ensure user privacy by not exposing emails in public-facing profile endpoints