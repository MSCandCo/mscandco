const performancePricing = [
    {
      stripeId: "prod_NXu2gPbDeF7xH3",
      name: "Performance Basic",
      features: ["1 Audiostems credit", true],
      credits: 1,
      monthly: {
        price: 39.99,
        id: "price_1MmoE1FP1MiYzMK9H6R7rTmO",
      },
      yearly: {
        price: 399.9,
        id: "price_1MmoLeFP1MiYzMK9SHCGfSBr",
      },
    },
    {
      stripeId: "prod_NXu5LW8r6jKbc1",
      name: "Performance Standard",
      features: ["5 Audiostems credit", true, true, true, true],
      credits: 5,
      monthly: {
        price: 99.99,
        id: "price_1MmoHVFP1MiYzMK96DmM1mX2",
      },
      yearly: {
        price: 999.9,
        id: "price_1MmoMEFP1MiYzMK9prVCaoqr",
      },
    },
    {
      stripeId: "prod_NYBiJqWIBiBgFf",
      name: "Performance Premium",
      features: ["10 Audiostems credit", true, true, true, true, true],
      credits: 10,
      monthly: {
        price: 249.99,
        id: "price_1Mn5KoFP1MiYzMK9aVsGNCSA",
      },
      yearly: {
        price: 2499.9,
        id: "price_1Mn5KoFP1MiYzMK9RSYRFesW",
      },
    },
    {
      stripeId: "prod_NXu8v2s3IC9SXV",
      name: "Performance Ultimate",
      features: [
        "15 Audiostems credit",
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
      ],
      credits: 15,
      monthly: {
        price: 499.99,
        id: "price_1MmoJrFP1MiYzMK93QZZe7yn",
      },
      yearly: {
        price: 4999.9,
        id: "price_1MmoMsFP1MiYzMK9cMY6N6GR",
      },
    },
  ];
  
  const recordingPricing = [
    {
      stripeId: "prod_NXuFJe9T00wlh5",
      name: "Recording Basic",
      features: ["1 Audiostems credit", true],
      credits: 1,
      monthly: {
        price: 99.99,
        id: "price_1MmoQYFP1MiYzMK9y8ikndJ2",
      },
      yearly: {
        price: 999.9,
        id: "price_1MmoQYFP1MiYzMK9BiXEGu6G",
      },
    },
    {
      stripeId: "prod_NXuGg6rZXYGQCx",
      name: "Recording Standard",
      features: ["5 Audiostems credit", true, true, true, true],
      credits: 5,
      monthly: {
        price: 399.99,
        id: "price_1MmoSLFP1MiYzMK9hhcnQaPY",
      },
      yearly: {
        price: 3999.9,
        id: "price_1MmoSLFP1MiYzMK9ou6NPo4f",
      },
    },
    {
      stripeId: "prod_NYBfptEnskUzCh",
      name: "Recording Premium",
      features: ["10 Audiostems credit", true, true, true, true, true],
      credits: 10,
      monthly: {
        price: 599.99,
        id: "price_1Mn5IDFP1MiYzMK9EqjkLUPt",
      },
      yearly: {
        price: 5999.9,
        id: "price_1Mn5IDFP1MiYzMK9zZ4BNIaY",
      },
    },
    {
      stripeId: "prod_NXuJ091mOJ0zFL",
      name: "Recording Ultimate",
      features: [
        "15 Audiostems credit",
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
      ],
      credits: 15,
      monthly: {
        price: 999.99,
        id: "price_1MmoUWFP1MiYzMK9g6ASBsLL",
      },
      yearly: {
        price: 9999.9,
        id: "price_1MmoUWFP1MiYzMK9TKbQD4e1",
      },
    },
  ];

  const getCreditsCountFromPriceId = (priceId) => {
    return (
        [...recordingPricing, ...performancePricing]
            ?.find(product => product.monthly.id === priceId || product.yearly.id === priceId)
            ?.credits
    ) || 0;
  }

  module.exports = {
    getCreditsCountFromPriceId
  }