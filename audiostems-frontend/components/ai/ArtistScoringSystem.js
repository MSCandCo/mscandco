import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Star, 
  Zap,
  Users,
  Music,
  DollarSign,
  Globe,
  Activity,
  Award,
  Lightbulb
} from 'lucide-react';

const ArtistScoringSystem = ({ artistId }) => {
  const [scores, setScores] = useState({
    aiScore: 0,
    potentialScore: 0,
    marketFit: 0,
    engagementRate: 0,
    growthRate: 0,
    collaborationPotential: 0,
    syncLicensingPotential: 0,
    brandPartnershipPotential: 0
  });

  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtistScores();
  }, [artistId]);

  const fetchArtistScores = async () => {
    try {
      setLoading(true);
      // Mock data for MVP - replace with actual AI scoring API
      const mockScores = {
        aiScore: 87.5,
        potentialScore: 92.3,
        marketFit: 78.9,
        engagementRate: 84.2,
        growthRate: 91.7,
        collaborationPotential: 88.4,
        syncLicensingPotential: 76.8,
        brandPartnershipPotential: 82.1
      };

      const mockInsights = [
        {
          type: 'strength',
          title: 'Strong Growth Trajectory',
          description: 'Artist shows exceptional growth rate of 91.7%',
          impact: 'high'
        },
        {
          type: 'opportunity',
          title: 'Sync Licensing Opportunity',
          description: 'Music style perfect for TV/film placements',
          impact: 'medium'
        },
        {
          type: 'recommendation',
          title: 'Collaboration Boost',
          description: 'Partnering with established artists could accelerate growth',
          impact: 'high'
        }
      ];

      const mockRecommendations = [
        {
          category: 'Career Development',
          title: 'Focus on Sync Licensing',
          description: 'Target TV/film music supervisors with your catalog',
          priority: 'high',
          estimatedImpact: '+25% revenue potential'
        },
        {
          category: 'Marketing',
          title: 'Social Media Campaign',
          description: 'Launch targeted campaign on TikTok and Instagram',
          priority: 'medium',
          estimatedImpact: '+15% audience growth'
        },
        {
          category: 'Collaboration',
          title: 'Strategic Partnerships',
          description: 'Connect with artists in similar genre for features',
          priority: 'high',
          estimatedImpact: '+30% reach expansion'
        }
      ];

      setScores(mockScores);
      setInsights(mockInsights);
      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Error fetching artist scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLevel = (score) => {
    if (score >= 90) return 'Exceptional';
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  const getInsightColor = (type) => {
    const colors = {
      strength: 'bg-green-100 text-green-800',
      opportunity: 'bg-blue-100 text-blue-800',
      recommendation: 'bg-purple-100 text-purple-800',
      warning: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
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
      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">AI Artist Scoring System</h1>
          <p className="text-muted-foreground">Advanced analytics and predictive insights</p>
        </div>
      </div>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Overall AI Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold text-primary">{scores.aiScore}</div>
            <div className="text-xl font-medium">{getScoreLevel(scores.aiScore)}</div>
            <Progress value={scores.aiScore} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Based on 15+ factors including growth, engagement, market fit, and potential
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Potential Score</span>
                <span className={`font-bold ${getScoreColor(scores.potentialScore)}`}>
                  {scores.potentialScore}
                </span>
              </div>
              <Progress value={scores.potentialScore} />

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Market Fit</span>
                <span className={`font-bold ${getScoreColor(scores.marketFit)}`}>
                  {scores.marketFit}
                </span>
              </div>
              <Progress value={scores.marketFit} />

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Engagement Rate</span>
                <span className={`font-bold ${getScoreColor(scores.engagementRate)}`}>
                  {scores.engagementRate}%
                </span>
              </div>
              <Progress value={scores.engagementRate} />

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Growth Rate</span>
                <span className={`font-bold ${getScoreColor(scores.growthRate)}`}>
                  {scores.growthRate}%
                </span>
              </div>
              <Progress value={scores.growthRate} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Opportunity Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Collaboration Potential</span>
                <span className={`font-bold ${getScoreColor(scores.collaborationPotential)}`}>
                  {scores.collaborationPotential}
                </span>
              </div>
              <Progress value={scores.collaborationPotential} />

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Sync Licensing</span>
                <span className={`font-bold ${getScoreColor(scores.syncLicensingPotential)}`}>
                  {scores.syncLicensingPotential}
                </span>
              </div>
              <Progress value={scores.syncLicensingPotential} />

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Brand Partnerships</span>
                <span className={`font-bold ${getScoreColor(scores.brandPartnershipPotential)}`}>
                  {scores.brandPartnershipPotential}
                </span>
              </div>
              <Progress value={scores.brandPartnershipPotential} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <Badge className={getInsightColor(insight.type)}>
                  {insight.type}
                </Badge>
                <div className="flex-1">
                  <h4 className="font-medium">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
                <Badge variant={insight.impact === 'high' ? 'destructive' : 'secondary'}>
                  {insight.impact} impact
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Strategic Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground">{rec.category}</p>
                  </div>
                  <Badge className={getPriorityColor(rec.priority)}>
                    {rec.priority} priority
                  </Badge>
                </div>
                <p className="text-sm mb-3">{rec.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-600">
                    {rec.estimatedImpact}
                  </span>
                  <Button size="sm" variant="outline">Implement</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Generate Growth Plan
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Find Collaborators
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Market Analysis
        </Button>
      </div>
    </div>
  );
};

export default ArtistScoringSystem; 