'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { Leaf, TrendingUp, DollarSign, Award, BarChart3 } from 'lucide-react';

export default function SustainabilityAdminPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { hasPermission, loading: permissionsLoading } = usePermissions();

  const [stats, setStats] = useState({
    totalCarbon: 0,
    offsetsPurchased: 0,
    activeProfiles: 0,
    achievements: 0
  });
  const [loading, setLoading] = useState(true);

  // Permission check
  useEffect(() => {
    if (!permissionsLoading) {
      if (!hasPermission('sustainability:manage') && !hasPermission('*:*:*')) {
        router.push('/');
        return;
      }
    }
  }, [permissionsLoading, hasPermission, router]);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        // Fetch carbon tracking stats
        const { data: carbon } = await supabase
          .from('carbon_footprint_tracking')
          .select('total_carbon_kg');

        const totalCarbon = carbon?.reduce((acc, c) => acc + (c.total_carbon_kg || 0), 0) || 0;

        // Fetch offset transactions
        const { data: offsets } = await supabase
          .from('carbon_offset_transactions')
          .select('offset_amount_kg');

        const offsetsPurchased = offsets?.reduce((acc, o) => acc + (o.offset_amount_kg || 0), 0) || 0;

        // Fetch active profiles
        const { count: profiles } = await supabase
          .from('sustainability_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_carbon_neutral_committed', true);

        // Fetch achievements
        const { count: achievements } = await supabase
          .from('sustainability_achievements')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalCarbon: Math.round(totalCarbon * 10) / 10,
          offsetsPurchased: Math.round(offsetsPurchased * 10) / 10,
          activeProfiles: profiles || 0,
          achievements: achievements || 0
        });
      } catch (error) {
        console.error('Error fetching sustainability stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!permissionsLoading && hasPermission('sustainability:manage')) {
      fetchStats();
    }
  }, [supabase, router, permissionsLoading, hasPermission]);

  if (permissionsLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sustainability management...</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Carbon Tracked',
      value: `${stats.totalCarbon} kg`,
      icon: BarChart3,
      color: 'bg-gray-500'
    },
    {
      title: 'Carbon Offset',
      value: `${stats.offsetsPurchased} kg`,
      icon: Leaf,
      color: 'bg-green-500'
    },
    {
      title: 'Committed Artists',
      value: stats.activeProfiles,
      icon: TrendingUp,
      color: 'bg-blue-500'
    },
    {
      title: 'Achievements Earned',
      value: stats.achievements,
      icon: Award,
      color: 'bg-yellow-500'
    }
  ];

  const netImpact = stats.totalCarbon - stats.offsetsPurchased;
  const offsetPercentage = stats.totalCarbon > 0
    ? Math.round((stats.offsetsPurchased / stats.totalCarbon) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Leaf className="w-8 h-8 text-green-600" />
            Carbon Management
          </h1>
          <p className="mt-2 text-gray-600">
            Track and manage platform-wide carbon footprint and sustainability initiatives
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Net Impact Card */}
        <div className={`rounded-lg shadow p-6 mb-8 ${netImpact <= 0 ? 'bg-green-50 border-2 border-green-200' : 'bg-yellow-50 border-2 border-yellow-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Net Carbon Impact</h2>
              <p className="text-3xl font-bold mt-2 ${netImpact <= 0 ? 'text-green-600' : 'text-yellow-600'}">
                {netImpact > 0 ? '+' : ''}{Math.round(netImpact * 10) / 10} kg CO2e
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {offsetPercentage}% of carbon footprint has been offset
              </p>
            </div>
            <div className={`p-4 rounded-full ${netImpact <= 0 ? 'bg-green-500' : 'bg-yellow-500'}`}>
              <Leaf className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Sustainability</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">DIMPACT 2024 Formula</h3>
                <p className="text-sm text-gray-600">Carbon calculation: 0.055 kWh/stream × 0.233 kg CO2e/kWh</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">Offset Providers</h3>
                <p className="text-sm text-gray-600">Greenspark, Ecologi, Offset Earth</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">Achievement System</h3>
                <p className="text-sm text-gray-600">{stats.achievements} badges earned platform-wide</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
