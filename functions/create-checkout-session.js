const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    const { email } = JSON.parse(event.body);

    // Determine base price ID
    let baseId = process.env.BASE_PRICE_ID;
    let basePriceId = baseId;
    if (baseId && baseId.startsWith('prod_')) {
      const product = await stripe.products.retrieve(baseId);
      basePriceId = typeof product.default_price === 'string' ? product.default_price : product.default_price.id;
    }
    const priceObj = await stripe.prices.retrieve(basePriceId);
    const mode = (priceObj.recurring || priceObj.type === 'recurring') ? 'subscription' : 'payment';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode,
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
