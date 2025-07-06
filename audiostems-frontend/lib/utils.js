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

export const openCustomerPortal = async () => {
  const { data } = await axios.get(
    `/api/req/stripe-utils/create-portal-session`
  );
  window.open(data);
};

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
