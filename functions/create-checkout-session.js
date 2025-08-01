const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/*
 * Creates a one‑time checkout session for purchasing the base nutrition plan.
 * The function expects an email in the request body and returns the session ID.
 */
exports.handler = async (event) => {
  try {
    const { email } = JSON.parse(event.body);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        { price: process.env.BASE_PRICE_ID, quantity: 1 },
      ],
      customer_email: email,
      success_url: `${process.env.URL}/upsell.html`,
      cancel_url: `${process.env.URL}/checkout.html`,
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Unable to create session' }),
    };
  }
};
