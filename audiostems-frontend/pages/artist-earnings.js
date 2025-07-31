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

  // Enhanced monthly data for charts
  const monthlyData = [
    { month: 'Jan', earnings: 180.50, streams: 12450, revenue: 145.20 },
    { month: 'Feb', earnings: 220.30, streams: 15230, revenue: 185.75 },
    { month: 'Mar', earnings: 198.75, streams: 13890, revenue: 165.40 },
    { month: 'Apr', earnings: 267.40, streams: 18560, revenue: 225.80 },
    { month: 'May', earnings: 298.15, streams: 21340, revenue: 265.30 },
    { month: 'Jun', earnings: 345.20, streams: 24680, revenue: 320.45 },
    { month: 'Jul', earnings: 398.75, streams: 28920, revenue: 375.60 },
    { month: 'Aug', earnings: 425.30, streams: 31250, revenue: 405.20 },
    { month: 'Sep', earnings: 456.80, streams: 33680, revenue: 435.90 },
    { month: 'Oct', earnings: 498.45, streams: 36720, revenue: 475.30 },
    { month: 'Nov', earnings: 542.60, streams: 39850, revenue: 520.15 },
    { month: 'Dec', earnings: 578.90, streams: 42460, revenue: 558.75 }
  ];

  // Platform performance data
  const platformData = [
    { platform: 'Spotify', earnings: 2856.40, percentage: 45.2, streams: 125430, color: '#1DB954' },
    { platform: 'Apple Music', earnings: 1824.60, percentage: 28.9, streams: 89720, color: '#FA243C' },
    { platform: 'YouTube Music', earnings: 945.30, percentage: 15.0, streams: 67840, color: '#FF0000' },
    { platform: 'Amazon Music', earnings: 425.70, percentage: 6.7, streams: 32150, color: '#FF9900' },
    { platform: 'Deezer', earnings: 198.45, percentage: 3.1, streams: 18560, color: '#FEAA2D' },
    { platform: 'Other Platforms', earnings: 72.85, percentage: 1.1, streams: 8420, color: '#6B7280' }
  ];

  // Chart configurations
  const earningsChartData = {
    labels: monthlyData.map(data => data.month),
    datasets: [
      {
        label: 'Monthly Earnings (£)',
        data: monthlyData.map(data => data.earnings),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };

  const performanceChartData = {
    labels: monthlyData.map(data => data.month),
    datasets: [
      {
        label: 'Streams',
        data: monthlyData.map(data => data.streams),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };

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
              return `${label}: £${value.toFixed(2)}`;
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

          {/* Trend Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Earnings Trend Chart */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Earnings Trend</h3>
                <FaTrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div className="h-64">
                <Line data={earningsChartData} options={chartOptions} />
              </div>
            </Card>

            {/* Performance Trend Chart */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Performance Trend</h3>
                <FaChartBar className="h-5 w-5 text-green-600" />
              </div>
              <div className="h-64">
                <Line data={performanceChartData} options={chartOptions} />
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
                        <p className="font-semibold text-gray-900">{formatCurrency(platform.earnings)}</p>
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