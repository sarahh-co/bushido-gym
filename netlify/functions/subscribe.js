exports.handler = async (event) => {
  // Debug: Log incoming request method
  console.log('[SUBSCRIBE] Request method:', event.httpMethod);

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    const error = 'Method not allowed';
    console.error('[SUBSCRIBE] Error:', error);
    return {
      statusCode: 405,
      body: JSON.stringify({ error })
    };
  }

  try {
    // Parse and validate email
    let email;
    try {
      const parsed = JSON.parse(event.body);
      email = parsed.email;
      console.log('[SUBSCRIBE] Parsed request body - email provided:', !!email);
    } catch (parseError) {
      console.error('[SUBSCRIBE] Failed to parse request body:', parseError.message);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid request body' })
      };
    }

    if (!email) {
      console.error('[SUBSCRIBE] Validation failed: email is required');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email is required' })
      };
    }

    // Check environment variable exists
    const apiKeyExists = !!process.env.BREVO_API_KEY;
    console.log('[SUBSCRIBE] BREVO_API_KEY configured:', apiKeyExists);

    if (!apiKeyExists) {
      console.error('[SUBSCRIBE] Critical error: BREVO_API_KEY not set in environment');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    // Call Brevo API
    console.log('[SUBSCRIBE] Calling Brevo API for email subscription');
    const brevoUrl = 'https://api.brevo.com/v3/contacts';

    let brevoResponse;
    try {
      brevoResponse = await fetch(brevoUrl, {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          listIds: [5],
          updateEnabled: true
        })
      });

      console.log('[SUBSCRIBE] Brevo API response status:', brevoResponse.status);
    } catch (fetchError) {
      console.error('[SUBSCRIBE] Brevo API fetch failed:', {
        message: fetchError.message,
        stack: fetchError.stack
      });
      return {
        statusCode: 503,
        body: JSON.stringify({ error: 'Failed to reach email service' })
      };
    }

    // Handle Brevo response
    if (brevoResponse.ok || brevoResponse.status === 400) {
      // 200: created, 400: already exists (both are acceptable)
      console.log('[SUBSCRIBE] Success - email added to list');
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: 'Email added to list' })
      };
    } else {
      // Log full error response from Brevo
      let brevoErrorBody;
      try {
        brevoErrorBody = await brevoResponse.text();
      } catch {
        brevoErrorBody = '(could not read response body)';
      }

      console.error('[SUBSCRIBE] Brevo API error:', {
        status: brevoResponse.status,
        statusText: brevoResponse.statusText,
        body: brevoErrorBody
      });

      return {
        statusCode: brevoResponse.status,
        body: JSON.stringify({
          error: 'Failed to add email to list',
          details: brevoResponse.statusText
        })
      };
    }
  } catch (error) {
    console.error('[SUBSCRIBE] Unexpected error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Server error',
        details: error.message
      })
    };
  }
};
