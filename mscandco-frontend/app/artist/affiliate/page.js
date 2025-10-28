'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { Users, DollarSign, TrendingUp, Copy, Check, Share2 } from 'lucide-react';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import { createClient } from '@/lib/supabase/client';

export default function AffiliatePage() {
  const { user } = useUser();
  const [affiliateData, setAffiliateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      loadAffiliateData();
    }
  }, [user]);

  const loadAffiliateData = async () => {
    try {
      const supabase = createClient();
      
      // Get or create affiliate link
      let { data: affiliateLink, error } = await supabase
        .from('affiliate_links')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // If no affiliate link exists, create one
      if (error && error.code === 'PGRST116') {
        const { data: createdLink, error: createError } = await supabase.rpc('generate_affiliate_code', {
          user_uuid: user.id
        });
        
        if (!createError && createdLink) {
          const { data: newLink } = await supabase
            .from('affiliate_links')
            .insert({
              user_id: user.id,
              affiliate_code: createdLink
            })
            .select()
            .single();
          
          affiliateLink = newLink;
        }
      }

      // Get conversions
      const { data: conversions } = await supabase
        .from('affiliate_conversions')
        .select('*')
        .eq('affiliate_link_id', affiliateLink?.id)
        .order('created_at', { ascending: false });

      setAffiliateData({
        ...affiliateLink,
        conversions: conversions || [],
      });
    } catch (error) {
      console.error('Failed to load affiliate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyAffiliateLink = () => {
    const link = `https://mscandco.com/signup?ref=${affiliateData.affiliate_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <PageLoading message="Loading affiliate program..." />;
  }

  const affiliateLink = `https://mscandco.com/signup?ref=${affiliateData?.affiliate_code || ''}`;
  const conversionRate = affiliateData?.total_referrals > 0
    ? ((affiliateData.total_conversions / affiliateData.total_referrals) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Affiliate Program</h1>
          <p className="text-gray-600">
            Earn 10% recurring commission on every referral. Share MSC & Co and get rewarded!
          </p>
        </div>

        {/* Affiliate Link Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Unique Referral Link</h2>
          <div className="flex gap-3">
            <input
              value={affiliateLink}
              readOnly
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60"
            />
            <button
              onClick={copyAffiliateLink}
              className="px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-sm text-gray-300 mt-4">
            Share this link with other artists. When they sign up and subscribe, you earn 10% recurring commission!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600">Total Referrals</span>
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {affiliateData?.total_referrals || 0}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600">Conversions</span>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {affiliateData?.total_conversions || 0}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600">Conversion Rate</span>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {conversionRate}%
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600">Total Earned</span>
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              £{(affiliateData?.total_earned || 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl p-8 mb-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Share Your Link</h3>
              <p className="text-gray-600">
                Share your unique referral link with other artists via social media, email, or word of mouth.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="font-bold text-gray-900 mb-2">They Subscribe</h3>
              <p className="text-gray-600">
                When they sign up using your link and subscribe to a paid plan, you earn a commission.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Earn Recurring Income</h3>
              <p className="text-gray-600">
                You earn 10% recurring commission for as long as they remain a subscriber. Paid monthly to your wallet!
              </p>
            </div>
          </div>
        </div>

        {/* Recent Conversions */}
        {affiliateData?.conversions && affiliateData.conversions.length > 0 && (
          <div className="bg-white rounded-2xl p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Conversions</h2>
            <div className="space-y-4">
              {affiliateData.conversions.map((conversion) => (
                <div key={conversion.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-semibold text-gray-900">
                      £{parseFloat(conversion.subscription_amount).toFixed(2)} subscription
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(conversion.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      +£{parseFloat(conversion.commission_amount).toFixed(2)}
                    </div>
                    <div className={`text-sm ${
                      conversion.status === 'paid' ? 'text-green-600' : 
                      conversion.status === 'pending' ? 'text-yellow-600' : 
                      'text-gray-600'
                    }`}>
                      {conversion.status.charAt(0).toUpperCase() + conversion.status.slice(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

