import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import MainLayout from "@/components/layouts/mainLayout";
import SEO from "@/components/seo";
import { Card, Button, Badge, Select, Tabs, Table } from "flowbite-react";
import { 
  HiGlobe,
  HiTrendingUp,
  HiTrendingDown,
  HiChartBar,
  HiMapPin,
  HiCalendar,
  HiDownload,
  HiEye,
  HiFilter
} from "lucide-react";
import useSWR from "swr";
import { apiRoute } from "@/lib/utils";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler } from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler);

function PlatformAnalytics() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const router = useRouter();
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [dateRange, setDateRange] = useState("12");
  const [activeTab, setActiveTab] = useState("overview");

  // Check if user is artist
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user || user['https://mscandco.com/role'] !== 'artist') {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, user, router]);

  const { data: platformAnalytics } = useSWR(
    apiRoute(`/monthly-statements/platform-analytics?dateRange=${dateRange}`)
  );

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated || !user || user['https://mscandco.com/role'] !== 'artist') {
    return null;
  }

  const platforms = platformAnalytics?.platforms || {};
  const geographicData = platformAnalytics?.geographicData || {};
  const trends = platformAnalytics?.trends || {};

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  // Platform performance chart data
  const platformPerformanceData = {
    labels: Object.keys(platforms),
    datasets: [
      {
        label: 'Total Earnings',
        data: Object.values(platforms).map(p => p.totalEarnings),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  // Geographic earnings chart data
  const geographicEarningsData = {
    labels: Object.keys(geographicData),
    datasets: [
      {
        label: 'Earnings by Country',
        data: Object.values(geographicData).map(d => d.earnings),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  // Platform growth trends chart data
  const platformGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: Object.entries(trends.platformGrowth || {}).map(([platform, data], index) => ({
      label: platform,
      data: data,
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)',
        'rgb(239, 68, 68)'
      ][index],
      backgroundColor: [
        'rgba(59, 130, 246, 0.1)',
        'rgba(16, 185, 129, 0.1)',
        'rgba(245, 158, 11, 0.1)',
        'rgba(239, 68, 68, 0.1)'
      ][index],
      tension: 0.4,
      fill: true
    }))
  };

  // Market share pie chart data
  const marketShareData = {
    labels: Object.keys(platforms),
    datasets: [
      {
        data: Object.values(platforms).map(p => p.marketShare),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  return (
    <MainLayout>
      <SEO title="Platform Analytics" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Analytics</h1>
              <p className="text-gray-600">Detailed insights across all streaming platforms</p>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                <option value="6">Last 6 months</option>
                <option value="12">Last 12 months</option>
                <option value="24">Last 24 months</option>
              </Select>
              <Button color="blue" onClick={() => window.print()}>
                <HiDownload className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Platform Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Object.entries(platforms).map(([platform, data], index) => (
            <Card key={platform} className={`border-l-4 border-l-${['blue', 'green', 'yellow', 'red'][index]}-500`}>
              <div className="flex items-center">
                <HiGlobe className={`h-8 w-8 text-${['blue', 'green', 'yellow', 'red'][index]}-600`} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{platform}</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.totalEarnings)}</p>
                  <p className={`text-sm ${data.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(data.growth)} growth
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Platform Performance</h3>
              <HiChartBar className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64">
              <Bar 
                data={platformPerformanceData} 
                options={{ 
                  maintainAspectRatio: false,
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return formatCurrency(value);
                        }
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }} 
              />
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Market Share</h3>
              <HiGlobe className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64">
              <Doughnut 
                data={marketShareData} 
                options={{ 
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `${context.label}: ${context.parsed}%`;
                        }
                      }
                    }
                  }
                }} 
              />
            </div>
          </Card>
        </div>

        {/* Platform Growth Trends */}
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Platform Growth Trends</h3>
            <div className="flex items-center space-x-2">
              <HiFilter className="h-4 w-4 text-gray-400" />
              <Select value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)} size="sm">
                <option value="all">All Platforms</option>
                <option value="spotify">Spotify</option>
                <option value="apple">Apple Music</option>
                <option value="youtube">YouTube</option>
                <option value="amazon">Amazon Music</option>
              </Select>
            </div>
          </div>
          <div className="h-64">
            <Line 
              data={platformGrowthData} 
              options={{ 
                maintainAspectRatio: false,
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return value + '%';
                      }
                    }
                  }
                },
                plugins: {
                  legend: {
                    position: 'top'
                  }
                }
              }} 
            />
          </div>
        </Card>

        {/* Tabs */}
        <Tabs.Group style="pills" onActiveTabChange={(tab) => setActiveTab(tab)}>
          <Tabs.Item title="Platform Details" icon={HiGlobe}>
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <Table.Head>
                    <Table.HeadCell>Platform</Table.HeadCell>
                    <Table.HeadCell>Total Earnings</Table.HeadCell>
                    <Table.HeadCell>Streams</Table.HeadCell>
                    <Table.HeadCell>Market Share</Table.HeadCell>
                    <Table.HeadCell>Growth</Table.HeadCell>
                    <Table.HeadCell>Top Tracks</Table.HeadCell>
                    <Table.HeadCell>Actions</Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {Object.entries(platforms).map(([platform, data]) => (
                      <Table.Row key={platform} className="hover:bg-gray-50">
                        <Table.Cell className="font-medium">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
                            {platform}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="font-semibold">
                          {formatCurrency(data.totalEarnings)}
                        </Table.Cell>
                        <Table.Cell>
                          {formatNumber(data.streams)}
                        </Table.Cell>
                        <Table.Cell>
                          {data.marketShare}%
                        </Table.Cell>
                        <Table.Cell>
                          <Badge color={data.growth > 0 ? 'success' : 'failure'}>
                            {formatPercentage(data.growth)}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="text-sm text-gray-600">
                            {data.topTracks.slice(0, 2).join(', ')}
                            {data.topTracks.length > 2 && '...'}
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <Button size="sm" color="gray">
                            <HiEye className="mr-1 h-3 w-3" />
                            View Details
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            </Card>
          </Tabs.Item>

          <Tabs.Item title="Geographic Data" icon={HiMapPin}>
            <Card>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-4">Earnings by Country</h4>
                  <div className="space-y-3">
                    {Object.entries(geographicData).map(([country, data], index) => (
                      <div key={country} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{country}</p>
                            <p className="text-sm text-gray-600">{formatNumber(data.streams)} streams</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(data.earnings)}</p>
                          <p className="text-sm text-gray-600">
                            {((data.earnings / Object.values(geographicData).reduce((sum, d) => sum + d.earnings, 0)) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4">Geographic Distribution</h4>
                  <div className="h-64">
                    <Doughnut 
                      data={geographicEarningsData} 
                      options={{ 
                        maintainAspectRatio: false,
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'bottom'
                          },
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
                </div>
              </div>
            </Card>
          </Tabs.Item>

          <Tabs.Item title="Trends & Insights" icon={HiTrendingUp}>
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">Monthly Growth Trends</h4>
                  <div className="h-48">
                    <Line 
                      data={{
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                        datasets: [{
                          label: 'Overall Growth',
                          data: trends.monthlyGrowth || [],
                          borderColor: 'rgb(59, 130, 246)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          tension: 0.4,
                          fill: true
                        }]
                      }} 
                      options={{ 
                        maintainAspectRatio: false,
                        responsive: true,
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return value + '%';
                              }
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            display: false
                          }
                        }
                      }} 
                    />
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4">Key Insights</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-semibold text-blue-900 mb-2">Top Performing Platform</h5>
                      <p className="text-blue-700">Spotify leads with 45.2% market share and 15.2% growth</p>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h5 className="font-semibold text-green-900 mb-2">Fastest Growing</h5>
                      <p className="text-green-700">YouTube shows 22.5% growth, highest among all platforms</p>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h5 className="font-semibold text-yellow-900 mb-2">Geographic Focus</h5>
                      <p className="text-yellow-700">United States and UK are your top markets</p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h5 className="font-semibold text-purple-900 mb-2">Revenue Opportunity</h5>
                      <p className="text-purple-700">Amazon Music has lowest market share but growing steadily</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Tabs.Item>
        </Tabs.Group>
      </div>
    </MainLayout>
  );
}

export default PlatformAnalytics; 