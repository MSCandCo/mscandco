import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Music, 
  DollarSign, 
  Target,
  Activity,
  Award,
  BarChart3,
  PieChart,
  Globe,
  Clock
} from 'lucide-react';

const ArtistAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState({
    totalArtists: 0,
    activeArtists: 0,
    newSignups: 0,
    growthRate: 0,
    totalStreams: 0,
    totalEarnings: 0,
    averageEngagement: 0,
    topPerformers: [],
    recentActivity: [],
    careerStages: {},
    acquisitionSources: {},
    aiInsights: []
  });

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Mock data for MVP - replace with actual API calls
      const mockData = {
        totalArtists: 1247,
        activeArtists: 892,
        newSignups: 45,
        growthRate: 12.5,
        totalStreams: 2847500,
        totalEarnings: 125000,
        averageEngagement: 78.3,
        topPerformers: [
          { name: "Sarah Chen", streams: 125000, growth: 23.4, stage: "breakthrough" },
          { name: "Marcus Johnson", streams: 98000, growth: 18.7, stage: "established" },
          { name: "Luna Rodriguez", streams: 87500, growth: 31.2, stage: "emerging" }
        ],
        recentActivity: [
          { artist: "Alex Thompson", action: "First Release", time: "2 hours ago" },
          { artist: "Maria Garcia", action: "Milestone Reached", time: "4 hours ago" },
          { artist: "David Kim", action: "Collaboration Request", time: "6 hours ago" }
        ],
        careerStages: {
          emerging: 45,
          developing: 32,
          established: 18,
          breakthrough: 4,
          legendary: 1
        },
        acquisitionSources: {
          organic: 35,
          referral: 28,
          social_media: 20,
          advertising: 12,
          partnership: 5
        },
        aiInsights: [
          { type: "performance", title: "Growth Opportunity", description: "Sarah Chen shows 23% growth potential", priority: "high" },
          { type: "collaboration", title: "Perfect Match", description: "Marcus & Luna collaboration could boost both careers", priority: "medium" },
          { type: "market", title: "Trend Alert", description: "Latin music trending in Q2", priority: "high" }
        ]
      };
      
      setAnalytics(mockData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getGrowthColor = (growth) => {
    return growth > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getStageColor = (stage) => {
    const colors = {
      emerging: 'bg-blue-100 text-blue-800',
      developing: 'bg-yellow-100 text-yellow-800',
      established: 'bg-green-100 text-green-800',
      breakthrough: 'bg-purple-100 text-purple-800',
      legendary: 'bg-red-100 text-red-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Artist Analytics Dashboard</h1>
          <p className="text-muted-foreground">Real-time insights and performance tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setTimeRange('7d')}>7D</Button>
          <Button variant="outline" onClick={() => setTimeRange('30d')}>30D</Button>
          <Button variant="outline" onClick={() => setTimeRange('90d')}>90D</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Artists</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.totalArtists)}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.newSignups} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Artists</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.activeArtists)}</div>
            <p className="text-xs text-muted-foreground">
              {((analytics.activeArtists / analytics.totalArtists) * 100).toFixed(1)}% engagement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Streams</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.totalStreams)}</div>
            <p className="text-xs text-muted-foreground">
              <span className={getGrowthColor(analytics.growthRate)}>
                +{analytics.growthRate}% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatNumber(analytics.totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              Average: ${(analytics.totalEarnings / analytics.activeArtists).toFixed(0)} per artist
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            AI Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.aiInsights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  <Badge variant={insight.priority === 'high' ? 'destructive' : 'secondary'}>
                    {insight.priority}
                  </Badge>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
                <Button size="sm" variant="outline">View</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Top Performing Artists
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topPerformers.map((artist, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{artist.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatNumber(artist.streams)} streams
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStageColor(artist.stage)}>
                    {artist.stage}
                  </Badge>
                  <span className={`text-sm ${getGrowthColor(artist.growth)}`}>
                    +{artist.growth}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Career Stages & Acquisition Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Career Stage Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.careerStages).map(([stage, count]) => (
                <div key={stage} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getStageColor(stage)}>
                      {stage}
                    </Badge>
                    <span className="text-sm">{count} artists</span>
                  </div>
                  <div className="w-24">
                    <Progress value={(count / analytics.totalArtists) * 100} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Acquisition Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.acquisitionSources).map(([source, percentage]) => (
                <div key={source} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{source.replace('_', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24">
                      <Progress value={percentage} />
                    </div>
                    <span className="text-sm">{percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{activity.artist}</h4>
                  <p className="text-sm text-muted-foreground">{activity.action}</p>
                </div>
                <span className="text-sm text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArtistAnalyticsDashboard; 