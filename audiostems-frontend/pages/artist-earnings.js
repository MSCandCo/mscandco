import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import MainLayout from "@/components/layouts/mainLayout";
import SEO from "@/components/seo";
import { Card, Button, Badge, Modal, TextInput, Label, Select, Tabs, Table } from "flowbite-react";
import { 
  FaDollarSign, 
  FaTrendingUp, 
  FaTrendingDown, 
  FaChartBar, 
  FaCalendar, 
  FaDownload, 
  FaMoneyBill,
  FaGlobe,
  FaMusic,
  FaFileText,
  FaCog,
  FaFilter,
  FaEye,
  FaPrint,
  FaEnvelope
} from "react-icons/fa";

function ArtistEarnings() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', { 
      style: 'currency', 
      currency: 'GBP' 
    }).format(amount);
  };

  // Mock data for demonstration
  const earningsData = {
    totalEarnings: 2450.75,
    thisMonth: 345.20,
    lastMonth: 298.15,
    growth: 15.8
  };

  const monthlyData = [
    { month: 'Jan', earnings: 180.50 },
    { month: 'Feb', earnings: 220.30 },
    { month: 'Mar', earnings: 198.75 },
    { month: 'Apr', earnings: 267.40 },
    { month: 'May', earnings: 298.15 },
    { month: 'Jun', earnings: 345.20 }
  ];

  return (
    <MainLayout>
      <SEO 
        title="Artist Earnings - MSC & Co" 
        description="Track your earnings, royalties, and revenue performance across all platforms." 
      />
      
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Artist Earnings</h1>
            <p className="text-gray-600">Track your earnings, royalties, and revenue performance.</p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaDollarSign className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(earningsData.totalEarnings)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaMoneyBill className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(earningsData.thisMonth)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaTrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{earningsData.growth}%</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaMusic className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Releases</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow">
            <Tabs.Group aria-label="Earnings tabs" style="underline">
              <Tabs.Item active title="Overview" icon={FaChartBar}>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Earnings Trend</h3>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <FaChartBar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Earnings chart would be displayed here</p>
                    </div>
                  </div>
                </div>
              </Tabs.Item>

              <Tabs.Item title="By Track" icon={FaMusic}>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <Table>
                      <Table.Head>
                        <Table.HeadCell>Track</Table.HeadCell>
                        <Table.HeadCell>Release</Table.HeadCell>
                        <Table.HeadCell>Streams</Table.HeadCell>
                        <Table.HeadCell>Earnings</Table.HeadCell>
                        <Table.HeadCell>Growth</Table.HeadCell>
                      </Table.Head>
                      <Table.Body className="divide-y">
                        <Table.Row className="bg-white">
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900">
                            Summer Vibes
                          </Table.Cell>
                          <Table.Cell>Urban Beats Collection</Table.Cell>
                          <Table.Cell>125,430</Table.Cell>
                          <Table.Cell>{formatCurrency(145.20)}</Table.Cell>
                          <Table.Cell>
                            <Badge color="success">+12%</Badge>
                          </Table.Cell>
                        </Table.Row>
                        <Table.Row className="bg-white">
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900">
                            City Lights
                          </Table.Cell>
                          <Table.Cell>Urban Beats Collection</Table.Cell>
                          <Table.Cell>98,720</Table.Cell>
                          <Table.Cell>{formatCurrency(98.15)}</Table.Cell>
                          <Table.Cell>
                            <Badge color="success">+8%</Badge>
                          </Table.Cell>
                        </Table.Row>
                      </Table.Body>
                    </Table>
                  </div>
                </div>
              </Tabs.Item>

              <Tabs.Item title="Statements" icon={FaFileText}>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Earnings Statements</h3>
                    <Button size="sm">
                      <FaDownload className="mr-2 h-4 w-4" />
                      Download All
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {monthlyData.slice(-3).reverse().map((data, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{data.month} 2024 Statement</h4>
                          <p className="text-sm text-gray-600">Total earnings: {formatCurrency(data.earnings)}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="xs" color="gray">
                            <FaDownload className="mr-1 h-3 w-3" />
                            PDF
                          </Button>
                          <Button size="xs" color="gray">
                            <FaEye className="mr-1 h-3 w-3" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Tabs.Item>
            </Tabs.Group>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default ArtistEarnings;