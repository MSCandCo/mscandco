import { performancePricing, recordingPricing } from "@/pages/pricing";

// TODO remove
export const PRODUCT_BY_ID = {
  "prod_NXu2gPbDeF7xH3": {
    name: "Performance Basic",
  },
  "prod_NXu5LW8r6jKbc1": {
    name: "Performance Standard",
  },
  "prod_NYBiJqWIBiBgFf": {
    name: "Performance Premium",
  },
};

export const getStripeProductById = (productId) => {
  return [...performancePricing, ...recordingPricing].find(
    (product) => product.stripeId === productId
  );
};
