# Netlify Serverless Function Setup

## Overview
The Brevo API key is now stored securely as a Netlify environment variable instead of being hardcoded in the frontend.

## Files Created
- `netlify/functions/subscribe.js` — Serverless function that handles email subscriptions
- `netlify.toml` — Netlify configuration file
- `.env.example` — Example environment variables for local development

## Setup Instructions

### 1. Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

### 2. Set Environment Variable
In Netlify dashboard:
1. Go to **Settings > Build & Deploy > Environment**
2. Add a new variable:
   - **Key**: `BREVO_API_KEY`
   - **Value**: Your Brevo API key (xsmtpsib-...)
3. Redeploy your site

### 3. Local Development
Create a `.env` file in the root directory:
```
BREVO_API_KEY=your_actual_api_key_here
```

Then run:
```bash
netlify dev
```

This starts a local development server that simulates the Netlify functions.

## How It Works
1. User submits email via the form in `index.html`
2. JavaScript sends POST request to `/.netlify/functions/subscribe`
3. Netlify function receives the email, reads `BREVO_API_KEY` from environment
4. Function calls Brevo API securely from the backend
5. Response is sent back to the frontend
6. User sees success/error message

## Security Benefits
✅ API key never exposed in client-side code
✅ API key stored as Netlify environment variable
✅ API key not committed to Git
✅ Can be rotated without redeploying frontend code
