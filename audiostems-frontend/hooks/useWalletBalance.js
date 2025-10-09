import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';

export function useWalletBalance(skip = false) {
  const { user } = useUser();
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWalletBalance = useCallback(async () => {
    // Skip wallet fetch if requested (e.g., for superadmins)
    if (skip) {
      setWalletBalance(0);
      setIsLoading(false);
      return;
    }

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

      // Fetch wallet balance from wallet API (same as earnings page)
      const response = await fetch(`/api/artist/wallet-simple?artist_id=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Wallet API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch wallet data');
      }

      const balance = data.wallet?.available_balance || 0;
      setWalletBalance(balance);
      console.log('Wallet balance fetched from API:', balance);

    } catch (err) {
      console.error('Error fetching wallet balance:', err);
      setError(err.message);
      setWalletBalance(0);
    } finally {
      setIsLoading(false);
    }
  }, [user, skip]);

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
