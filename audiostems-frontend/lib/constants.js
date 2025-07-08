import { performancePricing, recordingPricing } from "@/pages/pricing";
import { COMPANY_INFO } from "@/lib/brand-config";

// Company and platform constants
export const COMPANY_NAME = COMPANY_INFO.name;
export const COMPANY_DESCRIPTION = COMPANY_INFO.description;
export const COMPANY_WEBSITE = COMPANY_INFO.website;
export const COMPANY_EMAIL = COMPANY_INFO.email;

// Product constants
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
