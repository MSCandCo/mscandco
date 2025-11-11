'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import CarbonFootprintChart from '@/components/grant-features/CarbonFootprintChart';
import OffsetPurchaseModal from '@/components/grant-features/OffsetPurchaseModal';
import SustainabilityBadge from '@/components/grant-features/SustainabilityBadge';
import CarbonEquivalencies from '@/components/grant-features/CarbonEquivalencies';

export default function SustainabilityPage() {
  const supabase = createClientComponentClient();

  const [profile, setProfile] = useState(null);
  const [releases, setReleases] = useState([]);
  const [carbonData, setCarbonData] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [totalCarbon, setTotalCarbon] = useState(0);
  const [offsetCarbon, setOffsetCarbon] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showOffsetModal, setShowOffsetModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Load sustainability profile
      const { data: profileData } = await supabase
        .from('sustainability_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Load releases with carbon tracking
      const { data: releasesData } = await supabase
        .from('releases')
        .select('*, carbon_footprint_tracking(*)')
        .eq('user_id', user.id)
        .order('release_date', { ascending: false });

      setReleases(releasesData || []);

      // Calculate totals
      let total = 0;
      let offset = 0;
      const carbonByRelease = [];

      releasesData?.forEach((release) => {
        const tracking = release.carbon_footprint_tracking;
        if (tracking && tracking.length > 0) {
          tracking.forEach((t) => {
            total += parseFloat(t.total_carbon_kg || 0);
            offset += parseFloat(t.offset_purchased_kg || 0);
            carbonByRelease.push({
              release: release.title,
              carbon: parseFloat(t.total_carbon_kg || 0),
              streams: t.total_streams_count,
            });
          });
        }
      });

      setTotalCarbon(total);
      setOffsetCarbon(offset);
      setCarbonData(carbonByRelease);

      // Load achievements
      const { data: achievementsData } = await supabase
        .from('sustainability_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      setAchievements(achievementsData || []);

      setLoading(false);
    } catch (error) {
      console.error('Error loading sustainability data:', error);
      setLoading(false);
    }
  }

  const offsetPercentage = totalCarbon > 0 ? (offsetCarbon / totalCarbon) * 100 : 0;
  const remainingCarbon = totalCarbon - offsetCarbon;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Sustainability Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Track and offset your music streaming carbon footprint
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Carbon Footprint</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {totalCarbon.toFixed(2)} kg
          </p>
          <p className="text-xs text-gray-500 mt-1">CO₂e from streaming</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Carbon Offset</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {offsetCarbon.toFixed(2)} kg
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {offsetPercentage.toFixed(1)}% offset
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Remaining to Offset</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            {remainingCarbon.toFixed(2)} kg
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {(100 - offsetPercentage).toFixed(1)}% remaining
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Achievements</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {achievements.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Badges earned</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Charts & Data */}
        <div className="lg:col-span-2 space-y-6">
          {/* Carbon Footprint Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Carbon by Release</h2>
            <CarbonFootprintChart data={carbonData} />
          </div>

          {/* Releases Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Releases</h2>
            <div className="space-y-4">
              {releases.map((release) => {
                const tracking = release.carbon_footprint_tracking?.[0];
                return (
                  <div
                    key={release.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {release.title}
                        </h3>
                        {tracking && (
                          <p className="text-sm text-gray-500 mt-1">
                            {tracking.total_streams_count?.toLocaleString()} streams
                          </p>
                        )}
                      </div>
                      {tracking && (
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {parseFloat(tracking.total_carbon_kg).toFixed(2)} kg
                          </p>
                          <p className="text-xs text-gray-500">CO₂e</p>
                        </div>
                      )}
                    </div>

                    {tracking && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600">Offset Progress</span>
                          <span className="font-medium">
                            {tracking.offset_purchased_kg
                              ? ((tracking.offset_purchased_kg / tracking.total_carbon_kg) * 100).toFixed(0)
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${tracking.offset_purchased_kg
                                  ? ((tracking.offset_purchased_kg / tracking.total_carbon_kg) * 100).toFixed(0)
                                  : 0
                                }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {releases.length === 0 && (
                <p className="text-center py-8 text-gray-500">
                  No releases found. Upload music to track carbon footprint.
                </p>
              )}
            </div>
          </div>

          {/* Carbon Equivalencies */}
          <CarbonEquivalencies carbonKg={totalCarbon} />
        </div>

        {/* Right Column - Actions & Info */}
        <div className="space-y-6">
          {/* Offset Purchase Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Offset Your Carbon
            </h3>
            <p className="text-sm text-green-700 mb-4">
              Offset {remainingCarbon.toFixed(2)} kg CO₂e remaining
            </p>

            <div className="bg-white rounded p-4 mb-4">
              <p className="text-sm text-gray-600">Estimated Cost</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                £{(remainingCarbon * 0.015).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Based on £15 per tonne CO₂e
              </p>
            </div>

            <button
              onClick={() => setShowOffsetModal(true)}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
            >
              Purchase Carbon Offset
            </button>
          </div>

          {/* Sustainability Profile */}
          {profile && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Your Commitment</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={profile.carbon_neutral_commitment}
                    readOnly
                    className="h-4 w-4 text-green-600 rounded"
                  />
                  <label className="ml-3 text-sm text-gray-700">
                    Carbon Neutral Commitment
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={profile.auto_offset_enabled}
                    readOnly
                    className="h-4 w-4 text-green-600 rounded"
                  />
                  <label className="ml-3 text-sm text-gray-700">
                    Automatic Offsetting
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={profile.display_on_profile}
                    readOnly
                    className="h-4 w-4 text-green-600 rounded"
                  />
                  <label className="ml-3 text-sm text-gray-700">
                    Display Badge on Profile
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Achievements */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Achievements</h3>
            {achievements.length > 0 ? (
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <SustainabilityBadge
                    key={achievement.id}
                    achievement={achievement}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Start offsetting to earn achievements
              </p>
            )}
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              How It Works
            </h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start">
                <span className="mr-2">1.</span>
                <span>We track streaming carbon using DIMPACT 2024 methodology</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">2.</span>
                <span>0.055 kWh per stream × 0.233 kg CO₂e/kWh</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">3.</span>
                <span>Purchase verified carbon offsets from certified projects</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">4.</span>
                <span>Display your commitment with sustainability badges</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Offset Purchase Modal */}
      {showOffsetModal && (
        <OffsetPurchaseModal
          carbonKg={remainingCarbon}
          onClose={() => setShowOffsetModal(false)}
          onComplete={() => {
            setShowOffsetModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
