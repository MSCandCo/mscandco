import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, 
  BarChart3, 
  Download, 
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  Music,
  Globe,
  Target,
  Brain,
  Award
} from 'lucide-react';

const AdvancedArtistExport = () => {
  const [selectedReports, setSelectedReports] = useState([]);
  const [dateRange, setDateRange] = useState('30d');
  const [format, setFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    {
      id: 'performance',
      title: 'Performance Analytics',
      description: 'Streams, earnings, growth metrics',
      icon: TrendingUp,
      category: 'analytics'
    },
    {
      id: 'ai-scoring',
      title: 'AI Scoring Report',
      description: 'AI insights and potential analysis',
      icon: Brain,
      category: 'ai'
    },
    {
      id: 'career-development',
      title: 'Career Development',
      description: 'Milestones, achievements, goals',
      icon: Award,
      category: 'career'
    },
    {
      id: 'market-analysis',
      title: 'Market Analysis',
      description: 'Genre trends, audience demographics',
      icon: Globe,
      category: 'market'
    },
    {
      id: 'collaboration-opportunities',
      title: 'Collaboration Opportunities',
      description: 'Potential partnerships and features',
      icon: Users,
      category: 'collaboration'
    },
    {
      id: 'sync-licensing',
      title: 'Sync Licensing Report',
      description: 'TV/film placement opportunities',
      icon: Music,
      category: 'licensing'
    },
    {
      id: 'earnings-breakdown',
      title: 'Earnings Breakdown',
      description: 'Revenue streams and projections',
      icon: DollarSign,
      category: 'financial'
    },
    {
      id: 'audience-insights',
      title: 'Audience Insights',
      description: 'Demographics and engagement data',
      icon: Target,
      category: 'audience'
    }
  ];

  const handleReportToggle = (reportId) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleExport = async () => {
    if (selectedReports.length === 0) {
      alert('Please select at least one report type');
      return;
    }

    setLoading(true);
    try {
      // Mock export process - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate file download
      const link = document.createElement('a');
      link.href = '#';
      link.download = `artist-report-${Date.now()}.${format}`;
      link.click();
      
      console.log('Export completed:', {
        reports: selectedReports,
        format,
        dateRange
      });
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      analytics: 'bg-blue-100 text-blue-800',
      ai: 'bg-purple-100 text-purple-800',
      career: 'bg-green-100 text-green-800',
      market: 'bg-orange-100 text-orange-800',
      collaboration: 'bg-pink-100 text-pink-800',
      licensing: 'bg-indigo-100 text-indigo-800',
      financial: 'bg-emerald-100 text-emerald-800',
      audience: 'bg-cyan-100 text-cyan-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Advanced Artist Export System</h1>
          <p className="text-muted-foreground">Generate comprehensive reports and analytics</p>
        </div>
      </div>

      {/* Export Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Export Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Date Range</label>
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
                <option value="custom">Custom range</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Format</label>
              <select 
                value={format} 
                onChange={(e) => setFormat(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Include Charts</label>
              <div className="mt-1">
                <Checkbox defaultChecked />
                <span className="ml-2 text-sm">Visual analytics</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Report Types</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose the reports you want to include in your export
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              const isSelected = selectedReports.includes(report.id);
              
              return (
                <div
                  key={report.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleReportToggle(report.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={isSelected}
                      onChange={() => handleReportToggle(report.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <h3 className="font-medium">{report.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {report.description}
                      </p>
                      <Badge className={getCategoryColor(report.category)}>
                        {report.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Export Summary */}
      {selectedReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Export Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Selected Reports:</span>
                <span className="font-medium">{selectedReports.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Format:</span>
                <span className="font-medium uppercase">{format}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Date Range:</span>
                <span className="font-medium">{dateRange}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Estimated Size:</span>
                <span className="font-medium">~{(selectedReports.length * 2.5).toFixed(1)} MB</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          onClick={handleExport}
          disabled={selectedReports.length === 0 || loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Download className="h-4 w-4" />
          )}
          {loading ? 'Generating...' : 'Generate Export'}
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => setSelectedReports(reportTypes.map(r => r.id))}
        >
          Select All
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => setSelectedReports([])}
        >
          Clear All
        </Button>
      </div>

      {/* Quick Export Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Export Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSelectedReports(['performance', 'earnings-breakdown', 'audience-insights']);
                setFormat('pdf');
              }}
            >
              Executive Summary
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSelectedReports(['ai-scoring', 'career-development', 'collaboration-opportunities']);
                setFormat('excel');
              }}
            >
              Growth Strategy
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSelectedReports(['market-analysis', 'sync-licensing', 'audience-insights']);
                setFormat('pdf');
              }}
            >
              Market Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedArtistExport; 