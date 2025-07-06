import { userContext } from "@/components/contexts/userProvider";
import MainLayout from "@/components/layouts/mainLayout";
import SEO from "@/components/seo";
import { apiRoute } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useContext } from "react";
import { Button, Card, Badge } from "flowbite-react";
import { HiCreditCard, HiDownload, HiUser, HiCalendar } from "react-icons/hi2";
import { openCustomerPortal } from "@/lib/utils";
import { getStripeProductById } from "@/lib/constants";

function Dashboard() {
  const user = useContext(userContext);
  const { data: userSession } = useSession();

  const currentPlan = user?.productId ? getStripeProductById(user.productId) : null;

  return (
    <MainLayout>
      <SEO pageTitle="Dashboard" />
      <div className="py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
          
          {/* User Info Card */}
          <Card className="mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <HiUser className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
          </Card>

          {/* Subscription Status */}
          <Card className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <HiCreditCard className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Subscription Status</h3>
                  {user?.planActive ? (
                    <div className="flex items-center gap-2">
                      <Badge color="success">Active</Badge>
                      <span className="text-gray-600">
                        {currentPlan?.name || "Premium Plan"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge color="gray">Inactive</Badge>
                      <span className="text-gray-600">No active subscription</span>
                    </div>
                  )}
                </div>
              </div>
              {user?.planActive && (
                <Button onClick={openCustomerPortal}>
                  Manage Subscription
                </Button>
              )}
            </div>
          </Card>

          {/* Credits */}
          <Card className="mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <HiDownload className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Available Credits</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {user?.credit || 0} credits
                </p>
                <p className="text-sm text-gray-600">
                  Use credits to download songs and stems
                </p>
              </div>
              {user?.credit === 0 && (
                <Button href="/pricing" color="purple">
                  Get More Credits
                </Button>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button href="/songs" color="light" className="w-full justify-start">
                  Browse Songs
                </Button>
                <Button href="/stems" color="light" className="w-full justify-start">
                  Browse Stems
                </Button>
                <Button href="/lyrics" color="light" className="w-full justify-start">
                  Browse Lyrics
                </Button>
                <Button href="/playlists" color="light" className="w-full justify-start">
                  Browse Playlists
                </Button>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold mb-4">Account</h3>
              <div className="space-y-3">
                <Button href="/settings/me" color="light" className="w-full justify-start">
                  Edit Profile
                </Button>
                <Button href="/pricing" color="light" className="w-full justify-start">
                  View Plans
                </Button>
                {user?.planActive && (
                  <Button onClick={openCustomerPortal} color="light" className="w-full justify-start">
                    Billing Portal
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard; 