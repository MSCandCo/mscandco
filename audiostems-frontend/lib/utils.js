import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";

export const apiRoute = (path) => {
  return process.env.NEXT_PUBLIC_STRAPI + "/api" + path;
};

export const resourceUrl = (path) => {
  if (path.startsWith("http")) return path;
  return process.env.NEXT_PUBLIC_STRAPI + path;
};

// Stripe customer portal removed - using Mock Revolut billing system
export const openCustomerPortal = async () => {
  // Redirect to billing page instead
  window.location.href = '/billing';
};

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
