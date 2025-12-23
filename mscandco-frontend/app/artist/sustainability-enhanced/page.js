'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Leaf, TrendingDown, Award, ShoppingCart, Heart, Globe,
  Target, BarChart3, Zap, Trees, DollarSign, CheckCircle,
  AlertCircle, Info, ExternalLink, Download, Share2
} from 'lucide-react';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  calculateStreamingCarbon,
  calculateTouringCarbon,
  calculateOffsetCost,
  getCarbonNeutralityStatus,
  compareWithIndustry
} from '@/lib/sustainability/carbon-calculator';
import {
  calculateEarthPercentDonation,
  getEarthPercentStatus,
  enableEarthPercent,
  EARTHPERCENT_PROJECTS,
  getMarketingAssets,
  calculateImpactMetrics
} from '@/lib/sustainability/earthpercent';
import {
  OFFSET_PROVIDERS,
  getOffsetRecommendations,
  purchaseOffsets,
  getOffsetPortfolio,
  createOffsetSubscription
} from '@/lib/sustainability/offset-marketplace';

export default function SustainabilityEnhancedPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, earthpercent, marketplace, compare, badges

  // Data states
  const [artistData, setArtistData] = useState(null);
  const [carbonData, setCarbonData] = useState(null);
  const [earthPercentData, setEarthPercentData] = useState(null);
  const [offsetPurchases, setOffsetPurchases] = useState([]);
  const [industryComparison, setIndustryComparison] = useState(null);

  // UI states
  const [showEarthPercentModal, setShowEarthPercentModal] = useState(false);
  const [showOffsetModal, setShowOffsetModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [earthPercentPercentage, setEarthPercentPercentage] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Load artist profile with sustainability data
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setArtistData(profile);

      // Load streaming analytics for carbon calculation
      const { data: analytics } = await supabase
        .from('streaming_analytics')
        .select('*')
        .eq('artist_id', user.id)
        .order('date', { ascending: false })
        .limit(365); // Last year

      // Calculate total streams
      const totalStreams = analytics?.reduce((sum, day) => sum + (day.streams || 0), 0) || 0;

      // Calculate carbon footprint
      const carbonFootprint = calculateStreamingCarbon({
        streams: totalStreams,
        avgDurationMinutes: 3.5,
        region: profile?.country || 'default',
        connectionType: 'mobile', // Default assumption
        streamType: 'audio_stream'
      });

      setCarbonData(carbonFootprint);

      // Get EarthPercent status
      const earthPercent = getEarthPercentStatus({
        earthPercent: {
          earthPercentEnabled: profile?.earthpercent_enabled || false,
          earthPercentPercentage: profile?.earthpercent_percentage || 0,
          totalDonations: profile?.earthpercent_total_donations || 0,
          totalRoyalties: profile?.total_royalties || 0,
          memberSince: profile?.earthpercent_member_since
        }
      });

      setEarthPercentData(earthPercent);

      // Load offset purchases
      const { data: purchases } = await supabase
        .from('carbon_offset_purchases')
        .select('*')
        .eq('artist_id', user.id)
        .order('purchased_at', { ascending: false });

      setOffsetPurchases(purchases || []);

      // Calculate industry comparison
      const comparison = compareWithIndustry({
        totalEmissionsKg: carbonFootprint.totalEmissionsKg,
        totalStreams
      });

      setIndustryComparison(comparison);

      setLoading(false);
    } catch (error) {
      console.error('Error loading sustainability data:', error);
      setLoading(false);
    }
  }

  async function handleEnableEarthPercent() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const result = enableEarthPercent(user.id, earthPercentPercentage, [
        'renewable_energy',
        'reforestation',
        'ocean_protection'
      ]);

      // Update database
      await supabase
        .from('user_profiles')
        .update({
          earthpercent_enabled: true,
          earthpercent_percentage: earthPercentPercentage,
          earthpercent_member_since: new Date().toISOString()
        })
        .eq('id', user.id);

      alert(`EarthPercent enabled at ${earthPercentPercentage}%! Thank you for supporting climate action.`);
      setShowEarthPercentModal(false);
      loadData();
    } catch (error) {
      console.error('Error enabling EarthPercent:', error);
      alert('Failed to enable EarthPercent. Please try again.');
    }
  }

  async function handlePurchaseOffset(provider, tonnes) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const purchase = await purchaseOffsets({
        provider,
        emissionsTonnes: tonnes,
        artistId: user.id,
        paymentMethod: 'card',
        projectPreference: null,
        publicProfile: true
      });

      // Save to database
      await supabase
        .from('carbon_offset_purchases')
        .insert([{
          ...purchase,
          status: 'completed' // In production, this would be 'pending' until payment confirms
        }]);

      alert(`Successfully purchased ${tonnes} tonnes of carbon offsets from ${OFFSET_PROVIDERS[provider].name}!`);
      setShowOffsetModal(false);
      loadData();
    } catch (error) {
      console.error('Error purchasing offsets:', error);
      alert('Failed to purchase offsets. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading sustainability data...</p>
        </div>
      </div>
    );
  }

  const offsetPercentage = carbonData && offsetPurchases.length > 0
    ? (offsetPurchases.reduce((sum, p) => sum + (p.emissionsTonnes * 1000), 0) / carbonData.totalEmissionsKg) * 100
    : 0;

  const neutralityStatus = getCarbonNeutralityStatus({
    totalEmissions: carbonData?.totalEmissionsKg || 0,
    offsetsPurchased: offsetPurchases.reduce((sum, p) => sum + (p.emissionsTonnes * 1000), 0),
    offsetsCommitted: 0
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-600 p-3 rounded-xl">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Environmental Sustainability</h1>
              <p className="text-gray-600">Track your impact, offset your carbon, support climate action</p>
            </div>
          </div>
        </div>

        {/* Carbon Neutrality Badge */}
        {neutralityStatus.badge && (
          <div className="mb-6 bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center gap-4">
              <Award className="w-16 h-16" />
              <div>
                <h3 className="text-2xl font-bold">
                  {neutralityStatus.badge === 'carbon_neutral' && '🌍 Carbon Neutral Artist'}
                  {neutralityStatus.badge === 'climate_conscious' && '🌱 Climate Conscious'}
                  {neutralityStatus.badge === 'climate_committed' && '💚 Climate Committed'}
                </h3>
                <p className="text-white/90">
                  {neutralityStatus.neutralityPercentage}% of your emissions are offset
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-2 rounded-xl shadow-sm overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'earthpercent', label: 'EarthPercent', icon: Heart },
            { id: 'marketplace', label: 'Offset Marketplace', icon: ShoppingCart },
            { id: 'compare', label: 'Industry Compare', icon: Target },
            { id: 'badges', label: 'Badges & Certificates', icon: Award }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && carbonData && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                icon={TrendingDown}
                label="Total Emissions"
                value={`${carbonData.totalEmissionsKg.toFixed(2)} kg`}
                subValue={`${carbonData.totalEmissionsGrams.toFixed(0)} g CO2e`}
                color="red"
              />
              <StatCard
                icon={Zap}
                label="Per Stream"
                value={`${carbonData.emissionsPerStream.toFixed(2)} g`}
                subValue={`From ${carbonData.totalStreams.toLocaleString()} streams`}
                color="orange"
              />
              <StatCard
                icon={CheckCircle}
                label="Offsets Purchased"
                value={`${offsetPercentage.toFixed(1)}%`}
                subValue={`${offsetPurchases.length} purchases`}
                color="green"
              />
              <StatCard
                icon={Target}
                label="Remaining"
                value={`${neutralityStatus.remainingToOffset.toFixed(2)} kg`}
                subValue="To become carbon neutral"
                color="blue"
              />
            </div>

            {/* Carbon Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                  Emissions Breakdown
                </h3>
                <div className="space-y-4">
                  {Object.entries(carbonData.breakdown).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-700 capitalize">{key.replace('_', ' ')}</span>
                        <span className="font-semibold">{value.toFixed(2)} g</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(value / carbonData.totalEmissionsGrams) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equivalents */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold mb-4">Carbon Equivalents</h3>
                <div className="space-y-3">
                  <EquivalentRow icon="🚗" label="Car miles" value={carbonData.equivalents.carMiles} />
                  <EquivalentRow icon="✈️" label="Flight miles" value={carbonData.equivalents.flightMiles} />
                  <EquivalentRow icon="🌳" label="Trees needed" value={carbonData.equivalents.treesNeeded} />
                  <EquivalentRow icon="💡" label="Hours of LED light" value={carbonData.equivalents.hoursLightbulb} />
                  <EquivalentRow icon="🍔" label="Cheeseburgers" value={carbonData.equivalents.cheeseburgers} />
                  <EquivalentRow icon="📱" label="Phone charges" value={carbonData.equivalents.smartphones} />
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {neutralityStatus.recommendations && neutralityStatus.recommendations.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Info className="w-6 h-6 text-blue-600" />
                  Recommendations
                </h3>
                <div className="space-y-4">
                  {neutralityStatus.recommendations.map((rec, index) => (
                    <div key={index} className="border-l-4 border-green-600 pl-4 py-2">
                      <p className="font-semibold text-gray-900">{rec.message}</p>
                      <p className="text-sm text-gray-600">{rec.action}</p>
                      {rec.cost && (
                        <p className="text-sm text-green-600 font-medium mt-1">
                          Cost: ${rec.cost.totalCost} USD
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* EarthPercent Tab */}
        {activeTab === 'earthpercent' && earthPercentData && (
          <EarthPercentTab
            earthPercentData={earthPercentData}
            showModal={showEarthPercentModal}
            setShowModal={setShowEarthPercentModal}
            percentage={earthPercentPercentage}
            setPercentage={setEarthPercentPercentage}
            onEnable={handleEnableEarthPercent}
          />
        )}

        {/* Marketplace Tab */}
        {activeTab === 'marketplace' && carbonData && (
          <MarketplaceTab
            carbonData={carbonData}
            offsetPurchases={offsetPurchases}
            onPurchase={handlePurchaseOffset}
          />
        )}

        {/* Compare Tab */}
        {activeTab === 'compare' && industryComparison && (
          <ComparisonTab comparison={industryComparison} carbonData={carbonData} />
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <BadgesTab
            neutralityStatus={neutralityStatus}
            earthPercentData={earthPercentData}
            offsetPurchases={offsetPurchases}
          />
        )}
      </div>
    </div>
  );
}

// Component: Stat Card
function StatCard({ icon: Icon, label, value, subValue, color }) {
  const colorClasses = {
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600'
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <div className={`${colorClasses[color]} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-500">{subValue}</p>
    </div>
  );
}

// Component: Equivalent Row
function EquivalentRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-gray-700">{label}</span>
      </div>
      <span className="font-semibold text-gray-900">{value.toFixed(1)}</span>
    </div>
  );
}

// Component: EarthPercent Tab
function EarthPercentTab({ earthPercentData, showModal, setShowModal, percentage, setPercentage, onEnable }) {
  const impactMetrics = earthPercentData.totalDonations > 0
    ? calculateImpactMetrics(earthPercentData.totalDonations)
    : null;

  return (
    <div className="space-y-6">
      {!earthPercentData.isEnabled ? (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-2xl shadow-lg">
          <div className="flex items-start gap-6">
            <Heart className="w-16 h-16 flex-shrink-0" />
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">Join EarthPercent</h2>
              <p className="text-white/90 mb-4">
                Founded by Massive Attack & Brian Eno, EarthPercent encourages the music industry
                to donate 1-2% of royalties to climate action. Join thousands of artists making a difference.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Enable EarthPercent
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Heart className="w-8 h-8 text-pink-600" />
                EarthPercent Member
              </h2>
              <p className="text-gray-600">Donating {earthPercentData.percentage}% of royalties</p>
            </div>
            {earthPercentData.badgeTier && (
              <div className="text-center">
                <div className="text-3xl mb-1">
                  {earthPercentData.badgeTier === 'platinum' && '🏆'}
                  {earthPercentData.badgeTier === 'gold' && '🥇'}
                  {earthPercentData.badgeTier === 'silver' && '🥈'}
                  {earthPercentData.badgeTier === 'bronze' && '🥉'}
                  {earthPercentData.badgeTier === 'member' && '💚'}
                </div>
                <p className="text-sm font-semibold text-gray-700 capitalize">{earthPercentData.badgeTier}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <StatCard
              icon={DollarSign}
              label="Total Donations"
              value={`$${earthPercentData.totalDonations.toFixed(2)}`}
              subValue={`${earthPercentData.lifetimeDonationPercentage.toFixed(2)}% of royalties`}
              color="green"
            />
            <StatCard
              icon={TrendingDown}
              label="Monthly Average"
              value={`$${earthPercentData.avgDonationPerMonth.toFixed(2)}`}
              subValue={`Since ${new Date(earthPercentData.memberSince).toLocaleDateString()}`}
              color="blue"
            />
            <StatCard
              icon={Target}
              label="Projected Annual"
              value={`$${earthPercentData.projectedAnnualDonation.toFixed(2)}`}
              subValue="Based on current rate"
              color="purple"
            />
          </div>

          {impactMetrics && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4">Your Impact</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ImpactMetric icon="🌍" label="Tonnes Offset" value={impactMetrics.estimatedTonnesOffset} />
                <ImpactMetric icon="🌳" label="Trees Planted" value={impactMetrics.treesPlanted} />
                <ImpactMetric icon="🚗" label="Car Miles Avoided" value={impactMetrics.equivalents.carsMilesAvoided} />
                <ImpactMetric icon="👥" label="People Impacted" value={impactMetrics.equivalents.peopleImpacted} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Projects */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-bold mb-4">Supported Projects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(EARTHPERCENT_PROJECTS).slice(0, 4).map(([key, project]) => (
            <div key={key} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-2">{project.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{project.description}</p>
              <p className="text-xs text-green-600 font-medium">{project.impact}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Enable Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Enable EarthPercent</h3>
            <p className="text-gray-600 mb-6">
              Choose what percentage of your royalties to donate to climate action:
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Donation Percentage</label>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={percentage}
                onChange={(e) => setPercentage(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>0.5%</span>
                <span className="font-bold text-lg text-green-600">{percentage}%</span>
                <span>5%</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={onEnable}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Enable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Component: Marketplace Tab
function MarketplaceTab({ carbonData, offsetPurchases, onPurchase }) {
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [purchaseAmount, setPurchaseAmount] = useState(carbonData.totalEmissionsKg / 1000);

  const recommendations = getOffsetRecommendations({
    emissionsKg: carbonData.totalEmissionsKg,
    budget: null,
    preferences: {}
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Carbon Offset Marketplace</h2>
        <p className="text-gray-600 mb-6">
          Purchase verified carbon offsets from world-class providers. Your remaining emissions:{' '}
          <span className="font-bold text-green-600">{carbonData.totalEmissionsKg.toFixed(2)} kg</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(OFFSET_PROVIDERS).map(([key, provider]) => {
            const cost = calculateOffsetCost(carbonData.totalEmissionsKg, key);

            return (
              <div
                key={key}
                className="border-2 border-gray-200 rounded-xl p-6 hover:border-green-600 transition-all cursor-pointer"
                onClick={() => setSelectedProvider(key)}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-lg">{provider.name}</h3>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Rating</div>
                    <div className="text-xl font-bold text-green-600">{provider.rating}/5</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{provider.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price per tonne:</span>
                    <span className="font-semibold">${provider.pricePerTonne}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total cost:</span>
                    <span className="font-bold text-green-600">${cost.totalCost}</span>
                  </div>
                </div>
                {provider.bonusFeature && (
                  <div className="bg-green-50 text-green-700 text-xs p-2 rounded">
                    ⭐ {provider.bonusFeature}
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPurchase(key, cost.emissionsTonnes);
                  }}
                  className="w-full mt-4 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Purchase Offsets
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Purchase History */}
      {offsetPurchases.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-bold mb-4">Purchase History</h3>
          <div className="space-y-3">
            {offsetPurchases.map((purchase, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{purchase.providerName}</p>
                  <p className="text-sm text-gray-600">
                    {purchase.emissionsTonnes} tonnes • ${purchase.totalCost}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(purchase.purchasedAt).toLocaleDateString()}
                  </p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Component: Comparison Tab
function ComparisonTab({ comparison, carbonData }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Industry Comparison</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard
            icon={BarChart3}
            label="Your Emissions"
            value={`${comparison.artistEmissionsPerMillion.toFixed(2)} kg`}
            subValue="Per million streams"
            color={comparison.ranking === 'excellent' ? 'green' : 'orange'}
          />
          <StatCard
            icon={Globe}
            label="Industry Average"
            value={`${comparison.industryAverage} kg`}
            subValue="Per million streams"
            color="blue"
          />
          <StatCard
            icon={Target}
            label="Your Ranking"
            value={comparison.ranking.toUpperCase()}
            subValue={`${comparison.percentageDifference > 0 ? '+' : ''}${comparison.percentageDifference}% vs average`}
            color={comparison.ranking === 'excellent' ? 'green' : 'orange'}
          />
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
          <h3 className="font-bold text-lg mb-4">Benchmarks</h3>
          <div className="space-y-2">
            {Object.entries(comparison.benchmarks).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-gray-700 capitalize">{key.replace('_', ' ')}</span>
                <span className="font-semibold">{value} kg CO2e</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Component: Badges Tab
function BadgesTab({ neutralityStatus, earthPercentData, offsetPurchases }) {
  const badges = [];

  if (neutralityStatus.badge) {
    badges.push({
      name: neutralityStatus.badge.replace('_', ' ').toUpperCase(),
      description: `You have offset ${neutralityStatus.neutralityPercentage}% of your emissions`,
      icon: '🌍',
      earned: true
    });
  }

  if (earthPercentData.isEnabled) {
    badges.push({
      name: `EARTHPERCENT ${earthPercentData.badgeTier?.toUpperCase() || 'MEMBER'}`,
      description: `Donating ${earthPercentData.percentage}% of royalties to climate action`,
      icon: '💚',
      earned: true
    });
  }

  if (offsetPurchases.length > 0) {
    badges.push({
      name: 'CLIMATE SUPPORTER',
      description: `Purchased ${offsetPurchases.length} carbon offset${offsetPurchases.length > 1 ? 's' : ''}`,
      icon: '🌱',
      earned: true
    });
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Your Sustainability Badges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge, index) => (
            <div key={index} className="border-2 border-green-600 rounded-xl p-6 text-center">
              <div className="text-6xl mb-4">{badge.icon}</div>
              <h3 className="font-bold text-lg mb-2">{badge.name}</h3>
              <p className="text-sm text-gray-600">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Component: Impact Metric
function ImpactMetric({ icon, label, value }) {
  return (
    <div className="text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toFixed(1) : value}</div>
      <div className="text-xs text-gray-600">{label}</div>
    </div>
  );
}
