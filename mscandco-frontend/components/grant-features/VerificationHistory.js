'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function VerificationHistory({ releaseId }) {
  const supabase = createClientComponentClient();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [releaseId]);

  async function loadHistory() {
    try {
      const { data } = await supabase
        .from('copyright_verifications')
        .select('*')
        .eq('release_id', releaseId)
        .order('created_at', { ascending: false })
        .limit(10);

      setHistory(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading history:', error);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Verification History
      </h3>

      {history.length === 0 ? (
        <p className="text-sm text-gray-500">No verification history</p>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="border-l-2 border-gray-200 pl-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.verification_status.replace('_', ' ').toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(item.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {item.confidence_score && (
                  <span className="text-sm font-semibold text-gray-700">
                    {item.confidence_score}%
                  </span>
                )}
              </div>

              {item.potential_conflicts && item.potential_conflicts.length > 0 && (
                <p className="text-xs text-orange-600 mt-2">
                  {item.potential_conflicts.length} conflict(s) detected
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
