import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';

export function useSubscriptionStatus() {
  const { user } = useUser();
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubscriptionStatus = async () => {
    if (!user) {
      setSubscriptionStatus({ hasSubscription: false });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        setSubscriptionStatus({ hasSubscription: false });
        setLoading(false);
        return;
      }

      const response = await fetch('/api/user/subscription-status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      
      if (result.success) {
        setSubscriptionStatus(result.data);
      } else {
        setSubscriptionStatus({ hasSubscription: false });
      }
    } catch (err) {
      console.error('Failed to fetch subscription status:', err);
      setError(err.message);
      setSubscriptionStatus({ hasSubscription: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [user]);

  return {
    subscriptionStatus,
    loading,
    error,
    refetch: fetchSubscriptionStatus,
    hasActiveSubscription: subscriptionStatus?.hasSubscription || false,
    isPro: subscriptionStatus?.isPro || false,
    isStarter: subscriptionStatus?.isStarter || false,
    planName: subscriptionStatus?.planName || 'No Subscription'
  };
}
