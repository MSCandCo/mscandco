import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { getUserRoleSync } from '@/lib/user-utils';
import { supabase } from '@/lib/supabase';

export function useWalletBalance(skip = false) {
  const { user } = useUser();
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWalletBalance = useCallback(async () => {
    // Get user role from user object
    const userRole = user ? getUserRoleSync(user) : null;

    console.log('[useWalletBalance] Check:', { userRole, skip, user: !!user });

    // Priority 1: If no user, skip immediately
    if (!user) {
      console.log('[useWalletBalance] No user, skipping');
      setWalletBalance(0);
      setIsLoading(false);
      return;
    }

    // Priority 2: If skip is explicitly true OR userRole doesn't have a wallet, skip
    const hasWallet = userRole === 'artist' || userRole === 'label_admin';
    if (skip || !hasWallet) {
      console.log('[useWalletBalance] Skipping - skip parameter or role without wallet', { skip, hasWallet, userRole });
      setWalletBalance(0);
      setIsLoading(false);
      return;
    }

    // Priority 3: Wait for userRole to load before making API calls (only for non-skipped cases)
    if (!userRole) {
      console.log('[useWalletBalance] Waiting for userRole to load...');
      // Keep loading state, wait for userRole
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

      // Determine API endpoint based on user role
      let apiEndpoint = '/api/artist/wallet-simple';
      if (userRole === 'label_admin') {
        apiEndpoint = '/api/labeladmin/wallet-simple';
      } else if (userRole === 'artist') {
        apiEndpoint = '/api/artist/wallet-simple';
      }

      // Fetch wallet balance from role-specific wallet API
      const response = await fetch(apiEndpoint, {
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
