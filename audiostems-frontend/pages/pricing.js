import Container from "@/components/container";
import Header from "@/components/header";
import axios from "axios";
import classNames from "classnames";
import { Button, Spinner } from "flowbite-react";
import { Check, X, Globe, ChevronDown } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import SEO from "@/components/seo";
import { useAuth0 } from "@auth0/auth0-react";
import MainLayout from "@/components/layouts/mainLayout";
import { openCustomerPortal } from "@/lib/utils";
import { COMPANY_INFO } from "@/lib/brand-config";
import { getUserRole } from "@/lib/auth0-config";
import CurrencySelector, { formatCurrency as sharedFormatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';

// Currency configuration
const currencies = [
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 1.0 },
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.27 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 1.17 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.72 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.95 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 185.0 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', rate: 1.10 },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', rate: 13.2 },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', rate: 13.5 },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', rate: 8.8 },
  { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', rate: 5.1 },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', rate: 29.8 },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', rate: 450.0 },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei', rate: 5.9 },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', rate: 2.3 },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn', rate: 8.7 },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', rate: 115.0 },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', rate: 40.5 },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', rate: 6.3 },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', rate: 21.8 },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$', rate: 1080.0 },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$', rate: 1200.0 },
  { code: 'COP', name: 'Colombian Peso', symbol: '$', rate: 5000.0 },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', rate: 4.7 },
  { code: 'UYU', name: 'Uruguayan Peso', symbol: '$', rate: 50.0 },
  { code: 'VEF', name: 'Venezuelan Bolívar', symbol: 'Bs', rate: 35.0 },
  { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs', rate: 8.8 },
  { code: 'PYG', name: 'Paraguayan Guaraní', symbol: '₲', rate: 9200.0 },
  { code: 'KGS', name: 'Kyrgyzstani Som', symbol: 'с', rate: 110.0 },
  { code: 'TJS', name: 'Tajikistani Somoni', symbol: 'ЅМ', rate: 13.5 },
  { code: 'TMT', name: 'Turkmenistani Manat', symbol: 'T', rate: 4.4 },
  { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼', rate: 2.2 },
  { code: 'GEL', name: 'Georgian Lari', symbol: '₾', rate: 3.4 },
  { code: 'AMD', name: 'Armenian Dram', symbol: '֏', rate: 520.0 },
  { code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br', rate: 3.2 },
  { code: 'MDL', name: 'Moldovan Leu', symbol: 'L', rate: 22.5 },
  { code: 'ALL', name: 'Albanian Lek', symbol: 'L', rate: 120.0 },
  { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден', rate: 61.0 },
  { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин', rate: 137.0 },
  { code: 'BAM', name: 'Bosnia-Herzegovina Convertible Mark', symbol: 'KM', rate: 2.3 },
  { code: 'MNT', name: 'Mongolian Tögrög', symbol: '₮', rate: 3500.0 },
  { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸', rate: 580.0 },
  { code: 'KHR', name: 'Cambodian Riel', symbol: '៛', rate: 5200.0 },
  { code: 'LAK', name: 'Laotian Kip', symbol: '₭', rate: 26000.0 },
  { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K', rate: 2700.0 },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', rate: 140.0 },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨', rate: 160.0 },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', rate: 350.0 },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: '₨', rate: 400.0 },
  { code: 'MVR', name: 'Maldivian Rufiyaa', symbol: 'Rf', rate: 19.5 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 105.0 },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', rate: 20000.0 },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', rate: 45.0 },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', rate: 6.0 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rate: 1.7 },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', rate: 70.0 },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', rate: 31000.0 },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', rate: 1700.0 },
  { code: 'TWD', name: 'Taiwan New Dollar', symbol: 'NT$', rate: 40.0 },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', rate: 9.9 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 9.2 },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت', rate: 3.9 },
  { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج', rate: 170.0 },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م', rate: 12.8 },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', rate: 40.0 },
  { code: 'LYD', name: 'Libyan Dinar', symbol: 'ل.د', rate: 6.1 },
  { code: 'SDG', name: 'Sudanese Pound', symbol: 'ج.س', rate: 600.0 },
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', rate: 70.0 },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', rate: 200.0 },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', rate: 3200.0 },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', rate: 4800.0 },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', rate: 1600.0 },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', rate: 15.0 },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', rate: 24.0 },
  { code: 'NAD', name: 'Namibian Dollar', symbol: 'N$', rate: 24.0 },
  { code: 'BWP', name: 'Botswana Pula', symbol: 'P', rate: 17.0 },
  { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK', rate: 30.0 },
  { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK', rate: 2100.0 },
  { code: 'ZWL', name: 'Zimbabwean Dollar', symbol: 'Z$', rate: 500.0 },
  { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz', rate: 1000.0 },
  { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT', rate: 80.0 },
  { code: 'CVE', name: 'Cape Verdean Escudo', symbol: '$', rate: 130.0 },
  { code: 'STD', name: 'São Tomé and Príncipe Dobra', symbol: 'Db', rate: 28000.0 },
  { code: 'GMD', name: 'Gambian Dalasi', symbol: 'D', rate: 80.0 },
  { code: 'GNF', name: 'Guinean Franc', symbol: 'FG', rate: 11000.0 },
  { code: 'SLL', name: 'Sierra Leonean Leone', symbol: 'Le', rate: 25000.0 },
  { code: 'LRD', name: 'Liberian Dollar', symbol: 'L$', rate: 200.0 },
  { code: 'SLE', name: 'Sierra Leonean Leone', symbol: 'Le', rate: 25000.0 },
  { code: 'GIP', name: 'Gibraltar Pound', symbol: '£', rate: 1.0 },
  { code: 'FKP', name: 'Falkland Islands Pound', symbol: '£', rate: 1.0 },
  { code: 'SHP', name: 'Saint Helena Pound', symbol: '£', rate: 1.0 },
  { code: 'JEP', name: 'Jersey Pound', symbol: '£', rate: 1.0 },
  { code: 'GGP', name: 'Guernsey Pound', symbol: '£', rate: 1.0 },
  { code: 'IMP', name: 'Isle of Man Pound', symbol: '£', rate: 1.0 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 1.0 }
];

// Role-based pricing plans
const getRoleSpecificPlans = (role) => {
  switch (role) {
    case 'artist':
      return [
        {
          name: 'Artist Starter',
          monthlyPrice: 9.99,
          yearlyPrice: 99.99,
          yearlySavings: 19.89,
          stripeProductKey: 'artist_starter',
          features: [
            'Up to 10 releases per year',
            'Basic analytics and reporting',
            'Email support',
            'Distribution to major platforms (Spotify, Apple Music, etc.)',
            'Basic earnings tracking',
            'Release management tools'
          ]
        },
        {
          name: 'Artist Pro',
          monthlyPrice: 19.99,
          yearlyPrice: 199.99,
          yearlySavings: 39.89,
          stripeProductKey: 'artist_pro',
          features: [
            'Unlimited releases per year',
            'Advanced analytics and reporting',
            'Priority email and phone support',
            'Custom branding options',
            'Distribution to all major platforms',
            'Detailed earnings tracking and reporting',
            'Advanced release management tools',
            'Social media integration',
            'Marketing campaign tools',
            'Priority customer service',
            'Advanced royalty tracking',
            'Custom artist profile optimisation'
          ]
        }
      ];

    case 'company_admin':
      return [
        {
          name: 'Company Admin',
          monthlyPrice: 'Free',
          yearlyPrice: 'Free',
          yearlySavings: '',
          isFree: true,
          features: [
            'Unlimited Artists Management',
            'Label Analytics Dashboard',
            'Artist Content Oversight',
            'Advanced Reporting Tools',
            'Release Management',
            'Artist Performance Tracking',
            'Label Branding Options',
            'Priority Email Support',
            'Content Approval Workflows',
            'Revenue Tracking',
            'Artist Roster Management',
            'Release Calendar Management',
            'Label Analytics & Insights',
            'Multi-Artist Dashboard',
            'Content Distribution Oversight',
            'Label Performance Metrics',
            'Artist Development Tools',
            'Release Coordination',
            'Label Brand Management',
            'Advanced Content Controls',
            'Full Platform Administration',
            'User Management',
            'System Configuration',
            'Brand Management',
            'Advanced Analytics',
            'Priority Support'
          ]
        }
      ];

    case 'label_admin':
      return [
        {
          name: 'Label Admin',
          monthlyPrice: 29.99,
          yearlyPrice: 299.99,
          yearlySavings: 59.89,
          stripeProductKey: 'label_admin',
          features: [
            'Unlimited Artists Management',
            'Label Analytics Dashboard',
            'Artist Content Oversight',
            'Advanced Reporting Tools',
            'Release Management',
            'Artist Performance Tracking',
            'Label Branding Options',
            'Priority Email Support',
            'Content Approval Workflows',
            'Revenue Tracking',
            'Artist Roster Management',
            'Release Calendar Management',
            'Label Analytics & Insights',
            'Multi-Artist Dashboard',
            'Content Distribution Oversight',
            'Label Performance Metrics',
            'Artist Development Tools',
            'Release Coordination',
            'Label Brand Management',
            'Advanced Content Controls'
          ]
        }
      ];

    case 'super_admin':
      return [
        {
          name: 'Platform Basic',
          monthlyPrice: 499.99,
          yearlyPrice: 4999.99,
          yearlySavings: 999.89,
          features: [
            'Single Brand Management',
            'Basic Platform Analytics',
            'Email Support',
            'Standard Administration'
          ]
        },
        {
          name: 'Platform Enterprise',
          monthlyPrice: 999.99,
          yearlyPrice: 9999.99,
          yearlySavings: 1999.89,
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
          monthlyPrice: 1999.99,
          yearlyPrice: 19999.99,
          yearlySavings: 3999.89,
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
          name: 'Distribution Partner',
          monthlyPrice: 'Free',
          yearlyPrice: 'Free',
          yearlySavings: '',
          isFree: true,
          features: [
            'Full Distribution Analytics',
            'Complete Content Management',
            'Release Approval Workflows',
            'Partner Reporting Dashboard',
            'API Access',
            'Priority Support',
            'Artist Management Tools',
            'Revenue Tracking',
            'Custom Reporting',
            'Direct Platform Access'
          ]
        }
      ];

    default:
      return [
        {
          name: 'Basic Plan',
          monthlyPrice: 9.99,
          yearlyPrice: 99.99,
          yearlySavings: 19.89,
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
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chargingInterval, setChargingInterval] = useState('monthly');
  const [userRole, setUserRole] = useState(null);
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');

  // Auto-detect currency based on user's location (using shared currency system)
  useEffect(() => {
    const detectUserCurrency = async () => {
      try {
        // Try to get user's location from IP
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        // Supported currencies in shared system
        const supportedCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'NGN', 'GHS', 'KES', 'ZAR', 'ZMW'];
        
        if (data.country_code === 'GB') {
          updateCurrency('GBP');
        } else if (supportedCurrencies.includes(data.currency)) {
          updateCurrency(data.currency);
        } else {
          // Default to USD for countries not in our supported list
          updateCurrency('USD');
        }
      } catch (error) {
        // Could not detect user location, defaulting to GBP
        updateCurrency('GBP');
      }
    };

    detectUserCurrency();
  }, [updateCurrency]);

  // Use shared currency formatting functions



  useEffect(() => {
    if (isAuthenticated && user) {
      const role = getUserRole(user);
      setUserRole(role);
      setPlans(getRoleSpecificPlans(role));
    } else {
      // Show all plans for non-authenticated users
      const allPlans = [
        ...getRoleSpecificPlans('artist'),
        ...getRoleSpecificPlans('label_admin')
      ];
      setPlans(allPlans);
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
                src="/logos/msc-logo.png" 
                alt="MSC & Co" 
                className="h-12 w-auto mb-2"
                onError={(e) => {
                  e.target.src = '/logos/msc-logo.svg';
                  e.target.onerror = () => {
                    e.target.style.display = 'none';
                  };
                }}
              />
              <div className="text-lg text-gray-600">
                Pricing
              </div>
            </div>
            
            {/* Currency Selector */}
            <div className="flex justify-center">
              <CurrencySelector
                selectedCurrency={selectedCurrency}
                onCurrencyChange={updateCurrency}
                showLabel={true}
                showExchangeRate={true}
                compact={false}
              />
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className="relative p-6 rounded-lg border-2 transition-all hover:border-gray-300 border-gray-200"
              >
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {chargingInterval === 'monthly' ? sharedFormatCurrency(plan.monthlyPrice, selectedCurrency) : sharedFormatCurrency(plan.yearlyPrice, selectedCurrency)}
                    </span>
                    <span className="text-gray-500">
                      /{chargingInterval === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                  {chargingInterval === 'yearly' && (
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-sm text-gray-500 line-through">
                        {sharedFormatCurrency(plan.monthlyPrice, selectedCurrency)}/month
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        Save {sharedFormatCurrency(plan.yearlySavings, selectedCurrency)}
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
                  className="
                    bg-transparent 
                    text-[#1f2937] 
                    border 
                    border-[#1f2937] 
                    rounded-xl 
                    px-8 
                    py-3 
                    font-bold 
                    shadow 
                    transition-all 
                    duration-300 
                    hover:bg-[#1f2937] 
                    hover:text-white 
                    hover:shadow-lg 
                    hover:-translate-y-1
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[#1f2937]
                    w-full
                  "
                  style={{
                    backgroundColor: 'transparent',
                    color: '#1f2937',
                    borderColor: '#1f2937'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#1f2937';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#1f2937';
                  }}
                  onClick={() => {
                    if (!isAuthenticated) {
                      window.location.href = '/login';
                    } else {
                      // Handle subscription logic
                      // Subscribe to selected plan
                    }
                  }}
                >
                  {isAuthenticated 
                    ? (plan.name === 'Artist Pro' ? 'Upgrade to Pro' : plan.name === 'Artist Starter' ? 'Switch to Starter' : 'Select Plan')
                    : 'Sign Up'}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Need a custom plan? Contact our sales team for enterprise solutions.
            </p>
            <button className="text-[#1f2937] hover:text-gray-700 font-medium">
              Contact Sales
            </button>
          </div>
        </div>
      </Container>
    </MainLayout>
  );
}

export default Pricing;
