import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default function EarningsHistory({ artistId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [artistId]);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('earnings_entries')
        .select('*, releases(title)')
        .eq('artist_id', artistId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center rounded-2xl" style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
        border: '1px solid rgba(31, 41, 55, 0.08)'
      }}>
        <div className="animate-spin rounded-full h-8 w-8 mx-auto mb-4" style={{
          border: '2px solid #f3f4f6',
          borderTop: '2px solid #1f2937'
        }}></div>
        <p style={{color: '#64748b'}}>Loading earnings history...</p>
      </div>
    );
  }

  return (
    <div className="earnings-history">
      <h2 className="text-2xl font-bold mb-6" style={{color: '#1f2937'}}>Earnings History</h2>
      
      {history.length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
          border: '1px solid rgba(31, 41, 55, 0.08)'
        }}>
          <p style={{color: '#64748b'}}>No earnings history yet</p>
          <p className="text-sm mt-2" style={{color: '#9ca3af'}}>Your earnings will be tracked here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map(entry => (
            <div 
              key={entry.id}
              className="flex justify-between items-center p-4 rounded-lg transition-all duration-200 hover:shadow-md"
              style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
                border: '1px solid rgba(31, 41, 55, 0.08)'
              }}
            >
              <div>
                <p className="font-medium" style={{color: '#1f2937'}}>
                  {entry.releases?.title || 'Unknown Release'}
                </p>
                <p className="text-sm" style={{color: '#64748b'}}>
                  {entry.platform} • {entry.territory} • {entry.earning_type}
                </p>
                <p className="text-xs" style={{color: '#9ca3af'}}>
                  {new Date(entry.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-lg" style={{color: '#1f2937'}}>
                  {entry.currency}{entry.amount?.toFixed(2)}
                </p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  entry.status === 'paid' ? 'bg-green-100 text-green-800' :
                  entry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  entry.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {entry.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
