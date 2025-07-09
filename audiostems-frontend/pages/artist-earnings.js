import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import MainLayout from "@/components/layouts/mainLayout";
import SEO from "@/components/seo";
import { Card, Button, Badge, Modal, TextInput, Label, Select, Tabs, Table, Dropdown } from "flowbite-react";
import { 
  HiCurrencyPound, 
  HiTrendingUp, 
  HiTrendingDown, 
  HiChartBar, 
  HiCalendar, 
  HiDownload, 
  HiBanknotes,
  HiGlobe,
  HiMusicNote,
  HiDocumentText,
  HiCog,
  HiFilter,
  HiEye,
  HiPrinter,
  HiMail
} from "lucide-react";
import useSWR from "swr";
import { apiRoute } from "@/lib/utils";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler } from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import ExportButton from "@/components/export/ExportButton";
import ExportSettingsModal from "@/components/export/ExportSettingsModal";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler);

function ArtistEarnings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("12");
  const [showBankModal, setShowBankModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [dateRange, setDateRange] = useState("12");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [minEarnings, setMinEarnings] = useState(0);

  // Export functionality
  const [exportSettings, setExportSettings] = useState({});

  // Export columns configuration for earnings
  const exportColumns = [
    { header: 'Month', key: 'month', width: 15 },
    { header: 'Total Earnings', key: 'totalEarnings', width: 20 },
    { header: 'Streaming Revenue', key: 'streamingRevenue', width: 20 },
    { header: 'Performance Revenue', key: 'performanceRevenue', width: 20 },
    { header: 'Publishing Revenue', key: 'publishingRevenue', width: 20 },
    { header: 'Mechanical Revenue', key: 'mechanicalRevenue', width: 20 },
    { header: 'Licensing Revenue', key: 'licensingRevenue', width: 20 },
    { header: 'Sync Revenue', key: 'syncRevenue', width: 20 },
    { header: 'Total Streams', key: 'totalStreams', width: 15 },
    { header: 'Total Downloads', key: 'totalDownloads', width: 15 },
    { header: 'Growth %', key: 'growthPercentage', width: 15 }
  ];

  const handleExport = async (settings) => {
    try {
      const response = await fetch('/api/export/earnings/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          format: settings.format || 'pdf',
          detailLevel: settings.detailLevel || 'detailed'
        })
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${settings.filename || 'msc-earnings-statement'}.${settings.format || 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed: ' + error.message);
    }
  };

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

  // Prepare earnings data for export
  const exportData = statements?.data?.map(statement => ({
    month: `${statement.attributes.month}/${statement.attributes.year}`,
    totalEarnings: statement.attributes.totalEarnings,
    streamingRevenue: statement.attributes.streamingRevenue || 0,
    performanceRevenue: statement.attributes.performanceRevenue || 0,
    publishingRevenue: statement.attributes.publishingRevenue || 0,
    mechanicalRevenue: statement.attributes.mechanicalRevenue || 0,
    licensingRevenue: statement.attributes.licensingRevenue || 0,
    syncRevenue: statement.attributes.syncRevenue || 0,
    totalStreams: statement.attributes.totalStreams || 0,
    totalDownloads: statement.attributes.totalDownloads || 0,
    growthPercentage: statement.attributes.growthPercentage || 0
  })) || [];

  const { data: user } = useSWR(
    session ? apiRoute(`/users/me`) : null
  );

  const { data: trackEarnings } = useSWR(
    apiRoute("/monthly-statements/track-earnings")
  );

  const { data: projectEarnings } = useSWR(
    apiRoute("/monthly-statements/project-earnings")
  );

  const { data: platformAnalytics } = useSWR(
    apiRoute("/monthly-statements/platform-analytics")
  );

  if (status === "loading") {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (!session || session.user?.userRole !== "artist") {
    return null;
  }

  const totalEarnings = earningsAnalytics?.totalEarnings || 0;
  const averageMonthlyEarnings = earningsAnalytics?.averageMonthlyEarnings || 0;
  const growthRate = earningsAnalytics?.growthRate || 0;
  const monthlyData = earningsAnalytics?.monthlyData || [];
  const platformBreakdown = earningsAnalytics?.platformBreakdown || {};
  const thisMonthEarnings = monthlyData[monthlyData.length - 1]?.earnings || 0;
  const lastMonthEarnings = monthlyData[monthlyData.length - 2]?.earnings || 0;
  const bestPerformingTrack = earningsAnalytics?.topPerformingTracks?.[0] || { title: "No tracks", earnings: 0 };

  // Chart data for earnings over time
  const earningsChartData = {
    labels: monthlyData.map(d => `${d.month}/${d.year}`),
    datasets: [
      {
        label: 'Monthly Earnings (£)',
        data: monthlyData.map(d => d.earnings),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
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
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  // Chart data for revenue streams
  const revenueStreamsData = {
    labels: ['Streaming', 'Downloads', 'Licensing', 'Sync', 'Performance', 'Publishing'],
    datasets: [
      {
        label: 'Revenue by Stream',
        data: [
          totalEarnings * 0.55, // Streaming
          totalEarnings * 0.15, // Downloads
          totalEarnings * 0.12, // Licensing
          totalEarnings * 0.08, // Sync
          totalEarnings * 0.06, // Performance
          totalEarnings * 0.04  // Publishing
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)'
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

  const getGrowthColor = (rate) => {
    return rate > 0 ? 'text-green-600' : 'text-red-600';
  };

  const exportOptions = [
    { name: 'PDF Statement', icon: HiDocumentText, action: () => console.log('Export PDF') },
    { name: 'Excel Report', icon: HiDownload, action: () => console.log('Export Excel') },
    { name: 'Print Statement', icon: HiPrinter, action: () => console.log('Print') },
    { name: 'Email Statement', icon: HiMail, action: () => console.log('Email') }
  ];

  return (
    <MainLayout>
      <SEO title="Artist Earnings & Analytics" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Earnings & Analytics</h1>
              <p className="text-gray-600">Track your revenue, performance, and financial insights</p>
            </div>
            <div className="flex items-center space-x-3">
              <ExportButton
                userRole={session?.user?.userRole}
                exportType="earnings"
                data={exportData}
                columns={exportColumns}
                onExportStart={() => console.log('Export started')}
                onExportComplete={() => console.log('Export completed')}
                onExportError={(error) => alert('Export failed: ' + error)}
                variant="blue"
                size="sm"
              />
              <Button color="blue" onClick={() => setShowBankModal(true)}>
                <HiCog className="mr-2 h-4 w-4" />
                Banking
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <div className="flex items-center">
              <HiCurrencyPound className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(thisMonthEarnings)}</p>
                <p className={`text-sm ${getGrowthColor(growthRate)}`}>
                  {formatPercentage(growthRate)} vs last month
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <div className="flex items-center">
              <HiBanknotes className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalEarnings)}</p>
                <p className="text-sm text-gray-600">Lifetime revenue</p>
              </div>
            </div>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <div className="flex items-center">
              <HiTrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Average</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(averageMonthlyEarnings)}</p>
                <p className="text-sm text-gray-600">Per month</p>
              </div>
            </div>
          </Card>
          
          <Card className="border-l-4 border-l-orange-500">
            <div className="flex items-center">
              <HiMusicNote className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Best Track</p>
                <p className="text-lg font-bold text-gray-900">{bestPerformingTrack.title}</p>
                <p className="text-sm text-gray-600">{formatCurrency(bestPerformingTrack.earnings)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Revenue Trend</h3>
              <Select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} size="sm">
                <option value="6">Last 6 months</option>
                <option value="12">Last 12 months</option>
                <option value="24">Last 24 months</option>
              </Select>
            </div>
            <div className="h-64">
              <Line 
                data={earningsChartData} 
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
              <h3 className="text-lg font-semibold">Platform Breakdown</h3>
              <HiGlobe className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64">
              <Doughnut 
                data={platformChartData} 
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
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = ((context.parsed / total) * 100).toFixed(1);
                          return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Revenue Streams</h3>
            <div className="flex items-center space-x-2">
              <HiFilter className="h-4 w-4 text-gray-400" />
              <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)} size="sm">
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="12">Last 12 months</option>
              </Select>
            </div>
          </div>
          <div className="h-64">
            <Bar 
              data={revenueStreamsData} 
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

        {/* Tabs */}
        <Tabs.Group style="pills" onActiveTabChange={(tab) => setActiveTab(tab)}>
          <Tabs.Item title="Overview" icon={HiChartBar}>
            <Card>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-4">Top Performing Tracks</h4>
                  <div className="space-y-3">
                    {earningsAnalytics?.topPerformingTracks?.slice(0, 5).map((track, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{track.title}</p>
                            <p className="text-sm text-gray-600">{track.artist}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(track.earnings)}</p>
                          <p className="text-sm text-gray-600">{track.streams?.toLocaleString()} streams</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4">Platform Performance</h4>
                  <div className="space-y-3">
                    {Object.entries(platformBreakdown).map(([platform, earnings], index) => (
                      <div key={platform} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-3" style={{
                            backgroundColor: [
                              'rgba(255, 99, 132, 0.8)',
                              'rgba(54, 162, 235, 0.8)',
                              'rgba(255, 206, 86, 0.8)',
                              'rgba(75, 192, 192, 0.8)',
                              'rgba(153, 102, 255, 0.8)',
                              'rgba(255, 159, 64, 0.8)'
                            ][index % 6]
                          }}></div>
                          <span className="font-medium text-gray-900">{platform}</span>
                        </div>
                        <span className="font-semibold text-gray-900">{formatCurrency(earnings)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </Tabs.Item>
          
          <Tabs.Item title="By Track" icon={HiMusicNote}>
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-semibold">Track Earnings</h4>
                <div className="flex items-center space-x-3">
                  <TextInput
                    type="number"
                    placeholder="Min earnings"
                    value={minEarnings}
                    onChange={(e) => setMinEarnings(e.target.value)}
                    className="w-32"
                  />
                  <Select value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)}>
                    <option value="all">All Platforms</option>
                    <option value="spotify">Spotify</option>
                    <option value="apple">Apple Music</option>
                    <option value="youtube">YouTube</option>
                    <option value="amazon">Amazon</option>
                  </Select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <Table.Head>
                    <Table.HeadCell>Track</Table.HeadCell>
                    <Table.HeadCell>Project</Table.HeadCell>
                    <Table.HeadCell>Total Earnings</Table.HeadCell>
                    <Table.HeadCell>This Month</Table.HeadCell>
                    <Table.HeadCell>Streams</Table.HeadCell>
                    <Table.HeadCell>Platforms</Table.HeadCell>
                    <Table.HeadCell>Actions</Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {trackEarnings?.data?.map((track, index) => (
                      <Table.Row key={index} className="hover:bg-gray-50">
                        <Table.Cell className="font-medium">
                          <div>
                            <p className="text-gray-900">{track.title}</p>
                            <p className="text-sm text-gray-600">{track.artist}</p>
                          </div>
                        </Table.Cell>
                        <Table.Cell>{track.project}</Table.Cell>
                        <Table.Cell className="font-semibold">{formatCurrency(track.totalEarnings)}</Table.Cell>
                        <Table.Cell>{formatCurrency(track.thisMonth)}</Table.Cell>
                        <Table.Cell>{track.streams?.toLocaleString()}</Table.Cell>
                        <Table.Cell>
                          <div className="flex space-x-1">
                            {track.platforms?.map((platform, pIndex) => (
                              <Badge key={pIndex} color="gray" size="sm">{platform}</Badge>
                            ))}
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <Button size="sm" color="gray">
                            <HiEye className="mr-1 h-3 w-3" />
                            View
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            </Card>
          </Tabs.Item>

          <Tabs.Item title="By Project" icon={HiDocumentText}>
            <Card>
              <div className="mb-4">
                <h4 className="font-semibold mb-4">Project Performance</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {projectEarnings?.data?.map((project, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h5 className="font-semibold text-gray-900 mb-2">{project.title}</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Revenue:</span>
                          <span className="font-semibold">{formatCurrency(project.totalEarnings)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Tracks:</span>
                          <span>{project.trackCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Avg per track:</span>
                          <span>{formatCurrency(project.averagePerTrack)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Growth:</span>
                          <Badge color={project.growth > 0 ? 'success' : 'failure'}>
                            {formatPercentage(project.growth)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </Tabs.Item>

          <Tabs.Item title="Statements" icon={HiCalendar}>
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-semibold">Monthly Statements</h4>
                <Button color="blue" size="sm">
                  <HiDownload className="mr-2 h-4 w-4" />
                  Download All
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <Table.Head>
                    <Table.HeadCell>Month/Year</Table.HeadCell>
                    <Table.HeadCell>Earnings</Table.HeadCell>
                    <Table.HeadCell>Streams</Table.HeadCell>
                    <Table.HeadCell>Downloads</Table.HeadCell>
                    <Table.HeadCell>Growth</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Actions</Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {statements?.data?.map(statement => (
                      <Table.Row key={statement.id} className="hover:bg-gray-50">
                        <Table.Cell className="font-medium">
                          {statement.attributes.month}/{statement.attributes.year}
                        </Table.Cell>
                        <Table.Cell className="font-semibold">
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
                          <Badge color="success">Generated</Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex space-x-2">
                            <Button size="sm" color="gray">
                              <HiDownload className="mr-1 h-3 w-3" />
                              PDF
                            </Button>
                            <Button size="sm" color="gray">
                              <HiEye className="mr-1 h-3 w-3" />
                              View
                            </Button>
                          </div>
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
        <Modal show={showBankModal} onClose={() => setShowBankModal(false)} size="4xl">
          <Modal.Header>
            <div className="flex items-center">
              <HiBanknotes className="mr-2 h-5 w-5" />
              Banking & Payment Details
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Bank Account Information</h4>
                
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

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Payment Preferences</h4>
                
                <div>
                  <Label htmlFor="paymentMethod">Preferred Payment Method</Label>
                  <Select
                    id="paymentMethod"
                    defaultValue={user?.paymentPreferences?.method || 'bank_transfer'}
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="paypal">PayPal</option>
                    <option value="stripe">Stripe</option>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="payoutThreshold">Minimum Payout Threshold</Label>
                  <TextInput
                    id="payoutThreshold"
                    type="number"
                    placeholder="50"
                    defaultValue={user?.paymentPreferences?.payoutThreshold || 50}
                  />
                </div>
                
                <div>
                  <Label htmlFor="currency">Preferred Currency</Label>
                  <Select
                    id="currency"
                    defaultValue={user?.paymentPreferences?.currency || 'GBP'}
                  >
                    <option value="GBP">GBP (£)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="AUD">AUD (A$)</option>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="taxId">Tax ID / SSN</Label>
                  <TextInput
                    id="taxId"
                    type="password"
                    placeholder="For tax reporting purposes"
                    defaultValue={user?.taxInfo?.taxId || ''}
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Billing Address</Label>
                  <TextInput
                    id="address"
                    placeholder="Enter billing address"
                    defaultValue={user?.billingAddress?.address || ''}
                  />
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => setShowBankModal(false)} color="gray">Cancel</Button>
            <Button color="blue">Save Banking Details</Button>
          </Modal.Footer>
        </Modal>

        {/* Export Settings Modal */}
        <ExportSettingsModal
          show={showExportModal}
          onClose={() => setShowExportModal(false)}
          exportType="earnings"
          availableColumns={exportColumns}
          onExport={handleExport}
          userRole={session?.user?.userRole}
        />
      </div>
    </MainLayout>
  );
}

export default ArtistEarnings; 