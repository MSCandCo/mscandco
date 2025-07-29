import Container from "@/components/container";
import Header from "@/components/header";
import axios from "axios";
import classNames from "classnames";
import { Button, Spinner } from "flowbite-react";
import { Check, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import SEO from "@/components/seo";
import { useAuth0 } from "@auth0/auth0-react";
import MainLayout from "@/components/layouts/mainLayout";
import { openCustomerPortal } from "@/lib/utils";
import { COMPANY_INFO } from "@/lib/brand-config";
import { getUserRole } from "@/lib/auth0-config";

// Role-based pricing plans
const getRoleSpecificPlans = (role) => {
  switch (role) {
    case 'artist':
      return [
        {
          name: 'Artist Starter',
          monthlyPrice: '$9.99',
          yearlyPrice: '$99.99',
          yearlySavings: '$19.89',
          features: [
            'Up to 10 Releases',
            'Basic Analytics',
            'Email Support',
            'Standard Branding'
          ]
        },
        {
          name: 'Artist Pro',
          monthlyPrice: '$29.99',
          yearlyPrice: '$299.99',
          yearlySavings: '$59.89',
          features: [
            'Unlimited Releases',
            'Advanced Analytics',
            'Priority Support',
            'Custom Branding'
          ]
        }
      ];

    case 'company_admin':
      return [
        {
          name: 'Label Basic',
          monthlyPrice: '$99.99',
          yearlyPrice: '$999.99',
          yearlySavings: '$199.89',
          features: [
            'Up to 10 Artists',
            'Basic Label Analytics',
            'Email Support',
            'Standard Reporting'
          ]
        },
        {
          name: 'Label Management',
          monthlyPrice: '$199.99',
          yearlyPrice: '$1,999.99',
          yearlySavings: '$399.89',
          features: [
            'Unlimited Artists',
            'Label Analytics',
            'Artist Management',
            'Content Oversight',
            'Advanced Reporting'
          ]
        },
        {
          name: 'Label Enterprise',
          monthlyPrice: '$499.99',
          yearlyPrice: '$4,999.99',
          yearlySavings: '$999.89',
          features: [
            'Unlimited Artists',
            'Advanced Label Analytics',
            'Priority Support',
            'White-label Options',
            'API Access',
            'Dedicated Account Manager',
            'Custom Integrations'
          ]
        }
      ];

    case 'super_admin':
      return [
        {
          name: 'Platform Basic',
          monthlyPrice: '$499.99',
          yearlyPrice: '$4,999.99',
          yearlySavings: '$999.89',
          features: [
            'Single Brand Management',
            'Basic Platform Analytics',
            'Email Support',
            'Standard Administration'
          ]
        },
        {
          name: 'Platform Enterprise',
          monthlyPrice: '$999.99',
          yearlyPrice: '$9,999.99',
          yearlySavings: '$1,999.89',
          features: [
            'Multi-Brand Management',
            'Platform Analytics',
            'User Management',
            'System Administration',
            'Custom Branding',
            'API Access',
            'Dedicated Support'
          ]
        },
        {
          name: 'Platform Ultimate',
          monthlyPrice: '$1,999.99',
          yearlyPrice: '$19,999.99',
          yearlySavings: '$3,999.89',
          features: [
            'Unlimited Brands',
            'Advanced Platform Analytics',
            'Priority Support',
            'White-label Options',
            'Full API Access',
            'Dedicated Account Manager',
            'Custom Integrations',
            'On-premise Options'
          ]
        }
      ];

    case 'distribution_partner':
      return [
        {
          name: 'Partner Basic',
          monthlyPrice: '$79.99',
          yearlyPrice: '$799.99',
          yearlySavings: '$159.89',
          features: [
            'Basic Distribution Analytics',
            'Content Management',
            'Email Support',
            'Standard Reporting'
          ]
        },
        {
          name: 'Partner Pro',
          monthlyPrice: '$149.99',
          yearlyPrice: '$1,499.99',
          yearlySavings: '$299.89',
          features: [
            'Distribution Analytics',
            'Content Management',
            'Partner Reporting',
            'API Access',
            'Priority Support'
          ]
        },
        {
          name: 'Partner Enterprise',
          monthlyPrice: '$299.99',
          yearlyPrice: '$2,999.99',
          yearlySavings: '$599.89',
          features: [
            'Advanced Distribution Analytics',
            'Full Content Management',
            'Custom Reporting',
            'Full API Access',
            'Dedicated Support',
            'White-label Options',
            'Custom Integrations'
          ]
        }
      ];

    default:
      return [
        {
          name: 'Basic Plan',
          monthlyPrice: '$9.99',
          yearlyPrice: '$99.99',
          yearlySavings: '$19.89',
          features: [
            'Basic Features',
            'Email Support'
          ]
        }
      ];
  }
};

function Pricing() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [chargingInterval, setChargingInterval] = useState("monthly");
  const [loading, setLoading] = useState();
  const [userRole, setUserRole] = useState(null);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const role = getUserRole(user);
      setUserRole(role);
      setPlans(getRoleSpecificPlans(role));
    } else {
      // Default plans for non-authenticated users
      setPlans(getRoleSpecificPlans('artist'));
    }
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO pageTitle="Pricing" />
      <Container>
        <div className="py-16">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center mb-4">
              <img 
                src="/logos/yhwh-msc-logo.png" 
                alt="YHWH MSC" 
                className="h-12 w-auto mb-2"
                onError={(e) => {
                  e.target.src = '/logos/yhwh-msc-logo.svg';
                  e.target.onerror = () => {
                    e.target.style.display = 'none';
                  };
                }}
              />
              <div className="text-lg text-gray-600">
                Pricing
              </div>
            </div>
          </div>
          
          {isAuthenticated && userRole && (
            <div className="text-center mb-8">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {userRole.replace('_', ' ').toUpperCase()} Plans
              </span>
            </div>
          )}

          <div className="flex justify-center mb-8">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setChargingInterval('monthly')}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  chargingInterval === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setChargingInterval('yearly')}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  chargingInterval === 'yearly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                {chargingInterval === 'yearly' && (
                  <span className="ml-1 text-xs bg-green-100 text-green-800 px-1 rounded">
                    Save
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className="relative p-6 rounded-lg border-2 transition-all hover:border-gray-300 border-gray-200"
              >
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {chargingInterval === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                    </span>
                    <span className="text-gray-500">
                      /{chargingInterval === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                  {chargingInterval === 'yearly' && (
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-sm text-gray-500 line-through">
                        {plan.monthlyPrice}/month
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        Save {plan.yearlySavings}
                      </span>
                    </div>
                  )}
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className="w-full py-2 px-4 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    if (!isAuthenticated) {
                      window.location.href = '/login';
                    } else {
                      // Handle subscription logic
                      console.log('Subscribe to:', plan.name);
                    }
                  }}
                >
                  {isAuthenticated ? 'Select Plan' : 'Sign Up'}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Need a custom plan? Contact our sales team for enterprise solutions.
            </p>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Contact Sales
            </button>
          </div>
        </div>
      </Container>
    </MainLayout>
  );
}

export default Pricing;
