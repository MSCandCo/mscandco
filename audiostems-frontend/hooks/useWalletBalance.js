import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';

export function useWalletBalance() {
  const { user } = useUser();
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWalletBalance = useCallback(async () => {
    if (!user) {
      setWalletBalance(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get user session for API call
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      // Fetch wallet balance from user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('wallet_balance')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      const balance = profile?.wallet_balance || 0;
      setWalletBalance(balance);
      console.log('Wallet balance fetched:', balance);

    } catch (err) {
      console.error('Error fetching wallet balance:', err);
      setError(err.message);
      setWalletBalance(0);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch wallet balance on mount and when user changes
  useEffect(() => {
    fetchWalletBalance();
  }, [fetchWalletBalance]);

  // Refresh function for manual updates
  const refreshBalance = useCallback(async () => {
    console.log('Manually refreshing wallet balance...');
    await fetchWalletBalance();
  }, [fetchWalletBalance]);

  return {
    walletBalance,
    isLoading,
    error,
    refreshBalance
  };
}
