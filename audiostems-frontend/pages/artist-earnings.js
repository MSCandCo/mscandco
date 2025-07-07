import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import MainLayout from "@/components/layouts/mainLayout";
import SEO from "@/components/seo";
import { Card, Button, Badge, Modal, TextInput, Label, Select, Tabs, Table } from "flowbite-react";
import { HiCurrencyPound, HiTrendingUp, HiTrendingDown, HiChartBar, HiCalendar, HiDownload, HiBanknotes } from "lucide-react";
import useSWR from "swr";
import { apiRoute } from "@/lib/utils";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

function ArtistEarnings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("12");
  const [showBankModal, setShowBankModal] = useState(false);

  // Check if user is artist
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.userRole !== "artist") {
      router.push("/");
    }
  }, [session, status, router]);

  const { data: earningsAnalytics, mutate: mutateEarnings } = useSWR(
    apiRoute(`/monthly-statements/analytics?year=${new Date().getFullYear()}`)
  );

  const { data: statements, mutate: mutateStatements } = useSWR(
    apiRoute("/monthly-statements/user")
  );

  const { data: user } = useSWR(
    session ? apiRoute(`/users/me`) : null
  );

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session || session.user?.userRole !== "artist") {
    return null;
  }

  const totalEarnings = earningsAnalytics?.totalEarnings || 0;
  const averageMonthlyEarnings = earningsAnalytics?.averageMonthlyEarnings || 0;
  const growthRate = earningsAnalytics?.growthRate || 0;
  const monthlyData = earningsAnalytics?.monthlyData || [];
  const platformBreakdown = earningsAnalytics?.platformBreakdown || {};

  // Chart data for earnings over time
  const earningsChartData = {
    labels: monthlyData.map(d => `${d.month}/${d.year}`),
    datasets: [
      {
        label: 'Monthly Earnings (£)',
        data: monthlyData.map(d => d.earnings),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  };

  // Chart data for platform breakdown
  const platformChartData = {
    labels: Object.keys(platformBreakdown),
    datasets: [
      {
        data: Object.values(platformBreakdown),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Chart data for revenue streams
  const revenueStreamsData = {
    labels: ['Streaming', 'Downloads', 'Licensing', 'Sync', 'Performance'],
    datasets: [
      {
        label: 'Revenue by Stream',
        data: [
          totalEarnings * 0.6, // Streaming
          totalEarnings * 0.2, // Downloads
          totalEarnings * 0.1, // Licensing
          totalEarnings * 0.05, // Sync
          totalEarnings * 0.05  // Performance
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ]
      }
    ]
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (rate) => {
    return rate > 0 ? <HiTrendingUp className="text-green-500" /> : <HiTrendingDown className="text-red-500" />;
  };

  return (
    <MainLayout>
      <SEO title="Artist Earnings" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Earnings Dashboard</h1>
          <p className="text-gray-600">Track your revenue and streaming performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center">
              <HiCurrencyPound className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalEarnings)}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center">
              <HiBanknotes className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Average</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(averageMonthlyEarnings)}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center">
              <div className="h-8 w-8 text-purple-600">
                {getGrowthIcon(growthRate)}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                <p className={`text-2xl font-bold ${growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(growthRate)}
                </p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center">
              <HiCalendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Statements</p>
                <p className="text-2xl font-bold text-gray-900">{statements?.data?.length || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Bank Details Card */}
        <Card className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Bank Details</h3>
              <p className="text-sm text-gray-600">
                {user?.bankDetails ? 'Bank details configured' : 'No bank details configured'}
              </p>
            </div>
            <Button onClick={() => setShowBankModal(true)}>
              {user?.bankDetails ? 'Update' : 'Add'} Bank Details
            </Button>
          </div>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <h3 className="text-lg font-semibold mb-4">Earnings Over Time</h3>
            <div className="h-64">
              <Line 
                data={earningsChartData} 
                options={{ 
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return formatCurrency(value);
                        }
                      }
                    }
                  }
                }} 
              />
            </div>
          </Card>
          
          <Card>
            <h3 className="text-lg font-semibold mb-4">Platform Breakdown</h3>
            <div className="h-64">
              <Doughnut 
                data={platformChartData} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `${context.label}: ${formatCurrency(context.parsed)}`;
                        }
                      }
                    }
                  }
                }} 
              />
            </div>
          </Card>
        </div>

        {/* Revenue Streams Chart */}
        <Card className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Revenue Streams</h3>
          <div className="h-64">
            <Bar 
              data={revenueStreamsData} 
              options={{ 
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return formatCurrency(value);
                      }
                    }
                  }
                }
              }} 
            />
          </div>
        </Card>

        {/* Tabs */}
        <Tabs.Group style="pills" onActiveTabChange={(tab) => setActiveTab(tab)}>
          <Tabs.Item title="Overview" icon={HiChartBar}>
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">Top Performing Tracks</h4>
                  <div className="space-y-3">
                    {earningsAnalytics?.topPerformingTracks?.slice(0, 5).map((track, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{track.title}</p>
                          <p className="text-sm text-gray-600">{track.artist}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(track.earnings)}</p>
                          <p className="text-sm text-gray-600">{track.streams} streams</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4">Platform Performance</h4>
                  <div className="space-y-3">
                    {Object.entries(platformBreakdown).map(([platform, earnings]) => (
                      <div key={platform} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="font-medium">{platform}</span>
                        <span className="font-semibold">{formatCurrency(earnings)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </Tabs.Item>
          
          <Tabs.Item title="Monthly Statements" icon={HiCalendar}>
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <Table.Head>
                    <Table.HeadCell>Month/Year</Table.HeadCell>
                    <Table.HeadCell>Earnings</Table.HeadCell>
                    <Table.HeadCell>Streams</Table.HeadCell>
                    <Table.HeadCell>Downloads</Table.HeadCell>
                    <Table.HeadCell>Growth</Table.HeadCell>
                    <Table.HeadCell>Actions</Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {statements?.data?.map(statement => (
                      <Table.Row key={statement.id}>
                        <Table.Cell className="font-medium">
                          {statement.attributes.month}/{statement.attributes.year}
                        </Table.Cell>
                        <Table.Cell>
                          {formatCurrency(statement.attributes.totalEarnings)}
                        </Table.Cell>
                        <Table.Cell>
                          {statement.attributes.totalStreams?.toLocaleString() || 0}
                        </Table.Cell>
                        <Table.Cell>
                          {statement.attributes.totalDownloads || 0}
                        </Table.Cell>
                        <Table.Cell>
                          <Badge color={statement.attributes.growthPercentage > 0 ? 'success' : 'failure'}>
                            {formatPercentage(statement.attributes.growthPercentage || 0)}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Button size="sm">
                            <HiDownload className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            </Card>
          </Tabs.Item>
        </Tabs.Group>

        {/* Bank Details Modal */}
        <Modal show={showBankModal} onClose={() => setShowBankModal(false)}>
          <Modal.Header>
            Bank Details
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <div>
                <Label htmlFor="accountHolder">Account Holder Name</Label>
                <TextInput
                  id="accountHolder"
                  placeholder="Enter account holder name"
                  defaultValue={user?.bankDetails?.accountHolderName || ''}
                />
              </div>
              
              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <TextInput
                  id="accountNumber"
                  type="password"
                  placeholder="Enter account number"
                  defaultValue={user?.bankDetails?.accountNumber || ''}
                />
              </div>
              
              <div>
                <Label htmlFor="sortCode">Sort Code</Label>
                <TextInput
                  id="sortCode"
                  placeholder="Enter sort code"
                  defaultValue={user?.bankDetails?.sortCode || ''}
                />
              </div>
              
              <div>
                <Label htmlFor="bankName">Bank Name</Label>
                <TextInput
                  id="bankName"
                  placeholder="Enter bank name"
                  defaultValue={user?.bankDetails?.bankName || ''}
                />
              </div>
              
              <div>
                <Label htmlFor="accountType">Account Type</Label>
                <Select
                  id="accountType"
                  defaultValue={user?.bankDetails?.accountType || 'checking'}
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                  <option value="business">Business</option>
                </Select>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => setShowBankModal(false)}>Cancel</Button>
            <Button color="blue">Save Bank Details</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </MainLayout>
  );
}

export default ArtistEarnings; 