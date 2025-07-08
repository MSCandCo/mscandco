import Container from "@/components/container";
import Header from "@/components/header";
import MainLayout from "@/components/layouts/mainLayout";
import SEO from "@/components/seo";
import { COMPANY_INFO } from "@/lib/brand-config";
import { Button } from "flowbite-react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Register() {
  const router = useRouter();

  return (
    <MainLayout>
      <SEO pageTitle="Artist Registration" />
      <Container>
        <div className="min-h-screen flex items-center justify-center py-12">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">
                Join {COMPANY_INFO.name} as an Artist
              </h2>
              <p className="py-6">
                Join {COMPANY_INFO.name} as an artist. Start your music distribution journey today.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <form className="space-y-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <Button
                    type="submit"
                    className="w-full"
                    onClick={() => router.push('/register-auth0')}
                  >
                    Create Account
                  </Button>
                </div>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    color="gray"
                    className="w-full"
                    onClick={() => router.push('/register-auth0')}
                  >
                    Sign up with Auth0
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h3 className="font-semibold text-blue-900 mb-2">What you'll get as a {COMPANY_INFO.name} artist:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Multi-brand distribution platform</li>
                <li>• Access to YHWH MSC and Audio MSC services</li>
                <li>• Professional music distribution</li>
                <li>• Sync licensing opportunities</li>
                <li>• Artist development support</li>
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </MainLayout>
  );
}
