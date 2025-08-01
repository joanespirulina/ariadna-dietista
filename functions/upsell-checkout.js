const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/*
 * Creates a subscription checkout session for the nutrition coach upsell.
 * This endpoint returns a session ID for a monthly subscription defined
 * by the COACH_PRICE_ID environment variable. If the provided ID is a product ID,
 * the function retrieves its default price.
 */
exports.handler = async () => {
  try {
    // Determine the correct price ID. If the env variable points to a product (starts with "prod_"),
    // fetch its default price; otherwise, use the provided ID directly.
    let coachId = process.env.COACH_PRICE_ID;
    let coachPriceId = coachId;
    if (coachId && coachId.startsWith('prod_')) {
      const product = await stripe.products.retrieve(coachId);
      // product.default_price may be an ID or an object depending on API version
      coachPriceId = typeof product.default_price === 'string' ? product.default_price : product.default_price.id;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        { price: coachPriceId, quantity: 1 },
      ],
      success_url: 'https://ariadna-dietista.netlify.app/thanks.html',
      cancel_url: 'https://ariadna-dietista.netlify.app/upsell.html',
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
