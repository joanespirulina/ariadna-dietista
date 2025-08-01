const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/*
 * Creates a one-time checkout session for purchasing the base nutrition plan.
 * The function expects an email in the request body and returns the session ID.
 */
exports.handler = async (event) => {
  try {
    const { email } = JSON.parse(event.body);

    // Determine the correct price ID. If the env variable points to a product (starts with "prod_"),
    // fetch its default price; otherwise, use the provided ID directly.
    let baseId = process.env.BASE_PRICE_ID;
    let basePriceId = baseId;
    if (baseId && baseId.startsWith('prod_')) {
      const product = await stripe.products.retrieve(baseId);
      // product.default_price may be an ID or an object depending on API version
      basePriceId = typeof product.default_price === 'string' ? product.default_price : product.default_price.id;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        { price: basePriceId, quantity: 1 },
      ],
      customer_email: email,
      success_url: 'https://ariadna-dietista.netlify.app/upsell.html',
      cancel_url: 'https://ariadna-dietista.netlify.app/checkout.html',
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id }),
    };
  } catch (err) {
      console.error(err);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Unable to create checkout session' }),
      };
  }
};
