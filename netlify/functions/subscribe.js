exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email is required' })
      };
    }

    // Get API key from environment variable
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.error('BREVO_API_KEY environment variable not set');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    // Call Brevo API
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        listIds: [5],
        updateEnabled: true
      })
    });

    // Handle Brevo response
    if (response.ok || response.status === 400) {
      // 200: created, 400: already exists (both are acceptable)
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: 'Email added to list' })
      };
    } else {
      const errorData = await response.text();
      console.error('Brevo API error:', response.status, errorData);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Failed to add email to list' })
      };
    }
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};
