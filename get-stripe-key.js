/*
 * Return the Stripe publishable key to the client. This helper function
 * exposes only the publishable key and avoids embedding it directly
 * into the HTML. When deploying to Netlify, set STRIPE_PUBLISHABLE_KEY
 * in the environment variables.
 */
exports.handler = async () => {
  const key = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Publishable key not defined' }),
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify({ key }),
  };
};