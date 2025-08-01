const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/*
 * Creates a subscription checkout session for the nutrition coach upsell.
 * This endpoint returns a session ID for a monthly subscription defined
 * by the COACH_PRICE_ID environment variable.
 */
exports.handler = async () => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        { price: process.env.COACH_PRICE_ID, quantity: 1 },
      ],
      success_url: `${process.env.URL}/thanks.html`,
      cancel_url: `${process.env.URL}/upsell.html`,
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Unable to create subscription session' }),
    };
  }
};
