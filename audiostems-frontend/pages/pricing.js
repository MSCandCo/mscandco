import Container from "@/components/container";
import Header from "@/components/header";
import axios from "axios";
import classNames from "classnames";
import { Button, Spinner } from "flowbite-react";
import { Check, X } from "lucide-react";
import React, { useContext, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import SEO from "@/components/seo";
import { userContext } from "@/components/contexts/userProvider";
import MainLayout from "@/components/layouts/mainLayout";
import { openCustomerPortal } from "@/lib/utils";

const features = [
  "{}",
  "Access to all song lyrics library (choruses only)",
  "Access to all full song lyrics library",
  "Access to all songs melody library",
  "Complimentary artwork design with limited revisions",
  "Access to all music instrumental library",
  "Complimentary artwork design with unlimited revisions",
  "Complimentary audio mixing and mastering",
  "Melody to song lyrics service",
  "Artist feature consideration",
];

export const performancePricing = [
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

export const recordingPricing = [
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

function Pricing() {
  const user = useContext(userContext);

  const [chargingInterval, setChargingInterval] = useState("monthly");
  const [loading, setLoading] = useState();
  return (
    <MainLayout>
      <SEO pageTitle="Pricing" />
      <Container>
        <div className="py-16">
          <div className="text-4xl font-bold text-center">Pricing</div>
          <Button.Group className="mt-8 justify-center w-full">
            <Button
              color={chargingInterval === "monthly" ? "info" : "gray"}
              onClick={() => {
                setChargingInterval("monthly");
              }}
            >
              Monthly
            </Button>
            <Button
              color={chargingInterval === "yearly" ? "info" : "gray"}
              onClick={() => {
                setChargingInterval("yearly");
              }}
            >
              Yearly
            </Button>
          </Button.Group>

          <h2 className="my-6 text-2xl text-center">Performance packages</h2>
          <div className="w-full grid justify-center grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {performancePricing.map((p, i) => (
              <PackageListing
                actionName="Subscribe"
                user={user}
                p={p}
                chargingInterval={chargingInterval}
                loading={loading?.type === "p" && loading?.index === i}
                setLoading={(v) =>
                  v ? setLoading({ type: "p", index: i }) : setLoading(null)
                }
              />
            ))}
          </div>
          <h2 className="mt-12 mb-6 text-2xl text-center">
            Recording packages
          </h2>
          <div className="w-full grid justify-center grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {recordingPricing.map((p, i) => (
              <PackageListing
                actionName="Subscribe"
                user={user}
                p={p}
                chargingInterval={chargingInterval}
                loading={loading?.type === "r" && loading?.index === i}
                setLoading={(v) =>
                  v ? setLoading({ type: "r", index: i }) : setLoading(null)
                }
              />
            ))}
          </div>
        </div>
      </Container>
    </MainLayout>
  );
}

export default Pricing;

const PackageListing = ({
  p,
  chargingInterval,
  loading,
  setLoading,
  user,
  actionName,
}) => {
  const router = useRouter();
  // subscriptionId implies user has a subscription and can update their plan via Customer Portal
  const shouldOpenCustomerPortal = user && user.subscriptionId;
  const current = user && user?.planActive && user.productId === p.stripeId;

  return (
    <div className="p-4 rounded-lg border border-gray-200 shadow transition-shadow hover:shadow-md">
      <p className="text-lg font-semibold">{p.name}</p>
      <div className="mt-3 flex items-center gap-2">
        <div className="text-3xl font-bold">
          £{p[chargingInterval].price.toFixed(2)}
        </div>
        <div className="text-sm text-gray-500 max-w-[3ch] leading-none">
          per {chargingInterval === "monthly" ? "month" : "year"}
        </div>
      </div>
      <ul className="mt-5 flex flex-col gap-2">
        {features.map((f, i) => (
          <p
            className={classNames(
              "text-xs flex items-center gap-1.5",
              p.features[i] ? "text-gray-900" : "text-gray-400"
            )}
          >
            {p.features[i] ? (
              <Check
                className="text-emerald-700 shrink-0 h-4 w-4 rounded-full border-[1.5px] p-0.5 border-emerald-600"
                strokeWidth={3}
              />
            ) : (
              <X
                className="text-gray-600 shrink-0 h-4 w-4 rounded-full border-[1.5px] p-0.5 border-gray-300"
                strokeWidth={1}
              />
            )}
            {f === "{}" ? p.features[i] : f}
          </p>
        ))}
      </ul>
      <Button
        disabled={loading || current}
        className="w-full mt-8"
        size="lg"
        onClick={async () => {
          setLoading(true);
          if (!user) return router.push("/register");
          if (shouldOpenCustomerPortal) {
            await openCustomerPortal();
          } else {
            const { data } = await axios.get(
              `/api/req/stripe-utils/create-checkout-session?priceId=${p[chargingInterval].id}`
            );
            window.open(data.url);
          }
          setLoading(false);
        }}
      >
        {loading && <Spinner className="mr-2" />}
        {current ? "Current" : actionName}
      </Button>
    </div>
  );
};
