# Twitter Clone React Frontend

This is the React-based frontend for the Twitter Clone application.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Install dependencies:

```bash
npm install
```

## Development

To start the development server:

```bash
npm start
```

This will run the app in development mode at [http://localhost:3000](http://localhost:3000).

## Building for Production

To build the app for production:

```bash
npm run build
```

This will create an optimized build in the `build` folder.

## Configuration

The app is configured to proxy API requests to `http://localhost:8000` for development. If your backend is running on a different URL, update the `proxy` field in `package.json`.

## Project Structure

- `src/components/`: Reusable UI components
- `src/pages/`: Page components
- `src/services/`: API services for backend communication
- `src/utils/`: Utility functions
- `src/assets/`: Static assets like images

## Features

- User authentication (login/register)
- Tweet timeline
- User profiles
- Follow/unfollow users
- Profile picture upload
- Responsive design with Bootstrap