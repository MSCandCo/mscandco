'use client'

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { TrendingUp, Users, Music, Zap, ArrowRight, Crown, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { getLabelTierConfig, checkLabelTierLimits, getRecommendedLabelTier, calculateLabelUpgradeSavings, LABEL_TIERS } from '@/lib/label-tier-config';

export default function LabelTierUsageWidget({ userId }) {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (userId) {
      loadUsageData();
    }
  }, [userId]);

  const loadUsageData = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          label_tier,
          label_artist_count,
          label_releases_this_year,
          label_tracks_this_year,
          label_apollo_queries_this_month,
          label_total_earnings,
          label_total_streams,
          label_commissions_paid,
          label_qualified_for_partner
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;

      setUsage({
        tier: data.label_tier || LABEL_TIERS.STARTER,
        artist_count: data.label_artist_count || 0,
        releases_this_year: data.label_releases_this_year || 0,
        tracks_this_year: data.label_tracks_this_year || 0,
        apollo_queries_this_month: data.label_apollo_queries_this_month || 0,
        total_earnings: parseFloat(data.label_total_earnings) || 0,
        total_streams: data.label_total_streams || 0,
        commissions_paid: parseFloat(data.label_commissions_paid) || 0,
        qualified_for_partner: data.label_qualified_for_partner || false
      });
    } catch (err) {
      console.error('Error loading usage data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !usage) {
    return null;
  }

  const config = getLabelTierConfig(usage.tier);
  const limits = checkLabelTierLimits(usage.tier, usage);
  const recommendedTier = getRecommendedLabelTier(usage.tier, usage);
  const savings = recommendedTier ? calculateLabelUpgradeSavings(usage.tier, recommendedTier, usage.total_earnings) : null;

  const getUsagePercentage = (current, limit) => {
    if (limit <= 0) return 0; // Unlimited
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 75) return 'text-amber-600 bg-amber-100';
    return 'text-green-600 bg-green-100';
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-amber-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-lg p-6 border-2 border-blue-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">{config.displayName} Tier</h3>
          </div>
          <p className="text-sm text-gray-600">{(config.commission * 100).toFixed(0)}% commission</p>
        </div>
        <Link
          href="/label-pricing"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          Upgrade
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Auto-Qualification Banner */}
      {usage.qualified_for_partner && usage.tier !== LABEL_TIERS.PARTNER && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-900">
              🎉 You qualify for FREE Partner tier!
            </p>
            <p className="text-xs text-green-700 mt-1">
              Contact support to upgrade your account to Partner (12% commission) at no cost.
            </p>
          </div>
        </div>
      )}

      {/* Upgrade Prompt */}
      {limits.exceeded && recommendedTier && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">
              Tier limit reached
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Upgrade to {getLabelTierConfig(recommendedTier).displayName} for {savings.worthUpgrading ? `£${savings.netSavings.toFixed(2)}/year savings and ` : ''}more capacity.
            </p>
          </div>
        </div>
      )}

      {/* Usage Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Artists */}
        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Artists</span>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded ${getUsageColor(getUsagePercentage(usage.artist_count, config.limits.artists))}`}>
              {usage.artist_count}/{config.limits.artists > 0 ? config.limits.artists : '∞'}
            </span>
          </div>
          {config.limits.artists > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getProgressColor(getUsagePercentage(usage.artist_count, config.limits.artists))}`}
                style={{ width: `${getUsagePercentage(usage.artist_count, config.limits.artists)}%` }}
              />
            </div>
          )}
        </div>

        {/* Releases */}
        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Releases</span>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded ${getUsageColor(getUsagePercentage(usage.releases_this_year, config.limits.releases_per_year))}`}>
              {usage.releases_this_year}/{config.limits.releases_per_year > 0 ? config.limits.releases_per_year : '∞'}
            </span>
          </div>
          {config.limits.releases_per_year > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getProgressColor(getUsagePercentage(usage.releases_this_year, config.limits.releases_per_year))}`}
                style={{ width: `${getUsagePercentage(usage.releases_this_year, config.limits.releases_per_year)}%` }}
              />
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">Resets Jan 1st</p>
        </div>

        {/* Tracks */}
        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Tracks</span>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded ${getUsageColor(getUsagePercentage(usage.tracks_this_year, config.limits.tracks_per_year))}`}>
              {usage.tracks_this_year}/{config.limits.tracks_per_year > 0 ? config.limits.tracks_per_year : '∞'}
            </span>
          </div>
          {config.limits.tracks_per_year > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getProgressColor(getUsagePercentage(usage.tracks_this_year, config.limits.tracks_per_year))}`}
                style={{ width: `${getUsagePercentage(usage.tracks_this_year, config.limits.tracks_per_year)}%` }}
              />
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">Resets Jan 1st</p>
        </div>

        {/* Apollo */}
        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Apollo</span>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded ${getUsageColor(getUsagePercentage(usage.apollo_queries_this_month, config.limits.apollo_queries_per_month))}`}>
              {usage.apollo_queries_this_month}/{config.limits.apollo_queries_per_month > 0 ? config.limits.apollo_queries_per_month : '∞'}
            </span>
          </div>
          {config.limits.apollo_queries_per_month > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getProgressColor(getUsagePercentage(usage.apollo_queries_this_month, config.limits.apollo_queries_per_month))}`}
                style={{ width: `${getUsagePercentage(usage.apollo_queries_this_month, config.limits.apollo_queries_per_month)}%` }}
              />
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">Resets monthly</p>
        </div>
      </div>

      {/* CTA Button */}
      {recommendedTier && (
        <Link
          href="/label-pricing"
          className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          Upgrade to {getLabelTierConfig(recommendedTier).displayName} →
        </Link>
      )}
    </div>
  );
}
