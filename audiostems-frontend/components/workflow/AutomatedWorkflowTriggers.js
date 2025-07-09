import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Zap, 
  Clock, 
  Users, 
  Target, 
  Activity,
  Play,
  Pause,
  Settings,
  Bell,
  Mail,
  MessageSquare,
  Calendar,
  TrendingUp,
  Award,
  Star,
  Brain
} from 'lucide-react';

const AutomatedWorkflowTriggers = () => {
  const [triggers, setTriggers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTriggers();
  }, []);

  const fetchTriggers = async () => {
    try {
      setLoading(true);
      // Mock data for MVP - replace with actual API calls
      const mockTriggers = [
        {
          id: 1,
          name: 'Welcome Series',
          description: 'Automated welcome emails and onboarding guide',
          triggerType: 'event',
          event: 'artist_signup',
          status: 'active',
          priority: 'high',
          targetAudience: 'new_artists',
          executionCount: 1247,
          successRate: 94.2,
          actions: [
            { type: 'email', template: 'welcome_series_1', delay: '0h' },
            { type: 'email', template: 'onboarding_guide', delay: '24h' },
            { type: 'in_app', action: 'show_onboarding_tour', delay: '1h' }
          ]
        },
        {
          id: 2,
          name: 'Milestone Celebrations',
          description: 'Celebrate artist achievements and milestones',
          triggerType: 'event',
          event: 'milestone_reached',
          status: 'active',
          priority: 'medium',
          targetAudience: 'all_artists',
          executionCount: 892,
          successRate: 97.8,
          actions: [
            { type: 'email', template: 'milestone_celebration', delay: '0h' },
            { type: 'in_app', action: 'show_achievement_badge', delay: '0h' },
            { type: 'social_media', action: 'share_achievement', delay: '2h' }
          ]
        },
        {
          id: 3,
          name: 'Performance Alerts',
          description: 'Notify when artist performance drops or spikes',
          triggerType: 'condition',
          event: 'performance_drop',
          status: 'active',
          priority: 'high',
          targetAudience: 'established_artists',
          executionCount: 156,
          successRate: 89.5,
          actions: [
            { type: 'email', template: 'performance_alert', delay: '0h' },
            { type: 'in_app', action: 'show_performance_insights', delay: '0h' },
            { type: 'ai_insight', action: 'generate_recommendations', delay: '1h' }
          ]
        },
        {
          id: 4,
          name: 'Collaboration Opportunities',
          description: 'Suggest collaboration opportunities based on AI analysis',
          triggerType: 'ai_driven',
          event: 'collaboration_request',
          status: 'active',
          priority: 'medium',
          targetAudience: 'ai_selected',
          executionCount: 234,
          successRate: 76.3,
          actions: [
            { type: 'email', template: 'collaboration_suggestion', delay: '0h' },
            { type: 'in_app', action: 'show_collaboration_matches', delay: '0h' },
            { type: 'notification', action: 'push_collaboration_alert', delay: '0h' }
          ]
        },
        {
          id: 5,
          name: 'Weekly Progress Report',
          description: 'Weekly performance summary and insights',
          triggerType: 'schedule',
          event: 'weekly_report',
          status: 'active',
          priority: 'normal',
          targetAudience: 'all_artists',
          executionCount: 4567,
          successRate: 91.2,
          actions: [
            { type: 'email', template: 'weekly_report', delay: '0h' },
            { type: 'in_app', action: 'show_weekly_insights', delay: '0h' }
          ]
        },
        {
          id: 6,
          name: 'Growth Acceleration',
          description: 'AI-driven growth recommendations and actions',
          triggerType: 'ai_driven',
          event: 'growth_spike',
          status: 'testing',
          priority: 'high',
          targetAudience: 'emerging_artists',
          executionCount: 89,
          successRate: 82.1,
          actions: [
            { type: 'ai_insight', action: 'analyze_growth_patterns', delay: '0h' },
            { type: 'email', template: 'growth_opportunities', delay: '2h' },
            { type: 'in_app', action: 'show_growth_recommendations', delay: '0h' }
          ]
        }
      ];

      setTriggers(mockTriggers);
    } catch (error) {
      console.error('Error fetching triggers:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTrigger = (triggerId) => {
    setTriggers(prev => 
      prev.map(trigger => 
        trigger.id === triggerId 
          ? { ...trigger, status: trigger.status === 'active' ? 'inactive' : 'active' }
          : trigger
      )
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      testing: 'bg-yellow-100 text-yellow-800',
      draft: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      normal: 'bg-green-100 text-green-800',
      low: 'bg-blue-100 text-blue-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getActionIcon = (type) => {
    const icons = {
      email: Mail,
      in_app: Activity,
      notification: Bell,
      social_media: Users,
      ai_insight: Brain
    };
    return icons[type] || Activity;
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
        <Zap className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Automated Workflow Triggers</h1>
          <p className="text-muted-foreground">Intelligent automation for artist development</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Active Triggers</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {triggers.filter(t => t.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Total Executions</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {triggers.reduce((sum, t) => sum + t.executionCount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Success Rate</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {((triggers.reduce((sum, t) => sum + t.successRate, 0) / triggers.length) || 0).toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Artists Reached</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {(triggers.reduce((sum, t) => sum + t.executionCount, 0) * 0.8).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Triggers List */}
      <div className="space-y-4">
        {triggers.map((trigger) => (
          <Card key={trigger.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={trigger.status === 'active'}
                      onCheckedChange={() => toggleTrigger(trigger.id)}
                    />
                    <h3 className="font-medium">{trigger.name}</h3>
                  </div>
                  <Badge className={getStatusColor(trigger.status)}>
                    {trigger.status}
                  </Badge>
                  <Badge className={getPriorityColor(trigger.priority)}>
                    {trigger.priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    {trigger.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{trigger.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Trigger:</span> {trigger.event.replace('_', ' ')}
                  </div>
                  <div>
                    <span className="font-medium">Target:</span> {trigger.targetAudience.replace('_', ' ')}
                  </div>
                  <div>
                    <span className="font-medium">Executions:</span> {trigger.executionCount.toLocaleString()}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium">Actions:</span>
                  <div className="flex flex-wrap gap-2">
                    {trigger.actions.map((action, index) => {
                      const ActionIcon = getActionIcon(action.type);
                      return (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          <ActionIcon className="h-3 w-3" />
                          {action.type} ({action.delay})
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span>Success Rate: <span className="font-medium">{trigger.successRate}%</span></span>
                  <span>Last Executed: <span className="font-medium">2 hours ago</span></span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create New Trigger */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Trigger</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              AI-Powered Trigger
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Scheduled Trigger
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Event-Based Trigger
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Custom Trigger
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomatedWorkflowTriggers; 