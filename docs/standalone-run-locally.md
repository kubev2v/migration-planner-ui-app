# Local Development Guide

This guide provides instructions for setting up the Migration Planner UI to work with a local migration-planner API backend for development and testing purposes.

## Prerequisites

Before proceeding, ensure you have the following:

- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher
- **Migration-Planner API**: Running locally on your machine
- **Git**: For cloning and managing repositories

## Setting Up the Migration-Planner API

You need to have the Migration Planner installed and running locally.
Please follow the instructions in this guide:
https://github.com/kubev2v/migration-planner/blob/main/doc/run-locally.md

## Running the UI locally for Development

Run the UI in standalone mode with local development settings:

```bash
# Start the UI in standalone mode with local API (requires API running on localhost:3443)
make run-standalone
```

### Running without a backend (mock mode)

To run the UI with no backend—using mock data only—use:

```bash
# Start the UI with mock API (no backend required)
make run-standalone-mock
# or
npm run start:mock
```

Mock mode uses preloaded sources and assessments (including an example vCenter report). No proxy or API server is needed.

## Testing Your Changes

### 1. Access the Application

Once started, the application will be available at:

- **URL**: `http://localhost:3000`
- **Console**: Check browser console for any errors

### 2. Navigate Through the Wizard

1. **Start Migration Journey**: Click "Start your migration journey"
2. **Connect Step**: Create or select a discovery source
3. **Discovery Step**: View inventory data and test new features

### 3. Debugging API Calls

Use browser DevTools to monitor API requests:

1. **Open DevTools**: Press F12 or right-click → Inspect
2. **Network Tab**: Monitor all network requests
3. **Filter by API**: Look for calls to `/planner/api/v1`
4. **Check Status**: Ensure 200 OK responses (not 404 or CORS errors)
