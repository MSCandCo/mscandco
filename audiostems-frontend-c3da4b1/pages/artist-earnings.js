import { useUser } from '@/components/providers/SupabaseProvider';
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import MainLayout from "@/components/layouts/mainLayout";
import SEO from "@/components/seo";
import { Card, Button, Badge, Modal, TextInput, Label, Select, Tabs, Table } from "flowbite-react";
import { 
  FaDollarSign, 
  FaTrendingDown, 
  FaChartBar, 
  FaCalendar, 
  FaDownload, 
  FaMoneyBill,
  FaGlobe,
  FaMusic,
  FaCog,
  FaFilter,
  FaEye,
  FaPrint,
  FaEnvelope
} from "react-icons/fa";
import CurrencySelector, { formatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';
import { TrendingUp, FileText } from "lucide-react";

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function ArtistEarnings() {
  const { user, isLoading } = useUser();
  const isAuthenticated = !!user;
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

  // Import and use shared currency system
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');

  // Clean data - everything starts at 0 for new artists
  const earningsData = {
    totalEarnings: 0,
    thisMonth: 0,
    lastMonth: 0,
    growth: 0
  };

  // Empty monthly data for charts - will be populated when real data exists
  const monthlyData = [
    { month: 'Jan', earnings: 0, streams: 0, revenue: 0 },
    { month: 'Feb', earnings: 0, streams: 0, revenue: 0 },
    { month: 'Mar', earnings: 0, streams: 0, revenue: 0 },
    { month: 'Apr', earnings: 0, streams: 0, revenue: 0 },
    { month: 'May', earnings: 0, streams: 0, revenue: 0 },
    { month: 'Jun', earnings: 0, streams: 0, revenue: 0 },
    { month: 'Jul', earnings: 0, streams: 0, revenue: 0 },
    { month: 'Aug', earnings: 0, streams: 0, revenue: 0 },
    { month: 'Sep', earnings: 0, streams: 0, revenue: 0 },
    { month: 'Oct', earnings: 0, streams: 0, revenue: 0 },
    { month: 'Nov', earnings: 0, streams: 0, revenue: 0 },
    { month: 'Dec', earnings: 0, streams: 0, revenue: 0 }
  ];

  // Empty platform performance data - will show platforms but with 0 earnings
  const platformData = [
    { platform: 'Spotify', earnings: 0, percentage: 0, streams: 0, color: '#1DB954' },
    { platform: 'Apple Music', earnings: 0, percentage: 0, streams: 0, color: '#FA243C' },
    { platform: 'YouTube Music', earnings: 0, percentage: 0, streams: 0, color: '#FF0000' },
    { platform: 'Amazon Music', earnings: 0, percentage: 0, streams: 0, color: '#FF9900' },
    { platform: 'Deezer', earnings: 0, percentage: 0, streams: 0, color: '#FEAA2D' },
    { platform: 'Other Platforms', earnings: 0, percentage: 0, streams: 0, color: '#6B7280' }
  ];



  const platformChartData = {
    labels: platformData.map(data => data.platform),
    datasets: [
      {
        label: 'Earnings by Platform (£)',
        data: platformData.map(data => data.earnings),
        backgroundColor: platformData.map(data => data.color),
        borderColor: platformData.map(data => data.color),
        borderWidth: 2
      }
    ]
  };



  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#3B82F6',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (label.includes('Earnings') || label.includes('Revenue')) {
              return `${label}: ${formatCurrency(value, selectedCurrency)}`;
            } else if (label.includes('Streams')) {
              return `${label}: ${value.toLocaleString()}`;
            }
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6B7280'
        }
      },
      y: {
        grid: {
          color: 'rgba(107, 114, 128, 0.1)'
        },
        ticks: {
          color: '#6B7280',
          callback: function(value) {
            if (this.chart.data.datasets[0].label.includes('Earnings')) {
              return '£' + value.toFixed(0);
            } else if (this.chart.data.datasets[0].label.includes('Streams')) {
              return value.toLocaleString();
            }
            return value;
          }
        }
      }
    }
  };

  return (
    <MainLayout>
      <SEO 
        title="Artist Earnings - MSC & Co" 
        description="Track your earnings, royalties, and revenue performance across all platforms." 
      />
      
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Artist Earnings</h1>
                <p className="text-gray-600">Track your earnings, royalties, and revenue performance.</p>
              </div>
              <CurrencySelector 
                selectedCurrency={selectedCurrency}
                onCurrencyChange={updateCurrency}
                showLabel={true}
                className="flex-shrink-0"
              />
            </div>
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
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(earningsData.totalEarnings, selectedCurrency)}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(earningsData.thisMonth, selectedCurrency)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
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



          {/* Platform Breakdown Chart */}
          <div className="mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Platform Earnings Breakdown</h3>
                <FaGlobe className="h-5 w-5 text-purple-600" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64">
                  <Bar data={platformChartData} options={{
                    ...chartOptions,
                    indexAxis: 'y',
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        display: false
                      }
                    }
                  }} />
                </div>
                <div className="space-y-3">
                  {platformData.map((platform, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-3" 
                          style={{ backgroundColor: platform.color }}
                        ></div>
                        <span className="font-medium text-gray-900">{platform.platform}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(platform.earnings, selectedCurrency)}</p>
                        <p className="text-sm text-gray-600">{platform.percentage}% • {platform.streams.toLocaleString()} streams</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow">
            <Tabs.Group aria-label="Earnings tabs" style="underline">
              <Tabs.Item active title="Overview" icon={FaChartBar}>
                <div className="p-6">
                  <p className="text-gray-600 text-center">
                    📊 Trend charts are displayed above. This tab contains additional earnings details and track-by-track breakdowns.
                  </p>
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
                          <Table.Cell>{formatCurrency(145.20, selectedCurrency)}</Table.Cell>
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
                          <Table.Cell>{formatCurrency(98.15, selectedCurrency)}</Table.Cell>
                          <Table.Cell>
                            <Badge color="success">+8%</Badge>
                          </Table.Cell>
                        </Table.Row>
                      </Table.Body>
                    </Table>
                  </div>
                </div>
              </Tabs.Item>

              <Tabs.Item title="Statements" icon={FileText}>
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
                          <p className="text-sm text-gray-600">Total earnings: {formatCurrency(data.earnings, selectedCurrency)}</p>
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