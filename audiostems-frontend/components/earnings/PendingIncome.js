import { useState } from 'react';
import { Calendar, Music, MapPin, DollarSign } from 'lucide-react';

export default function PendingIncome({ pendingEntries, wallet }) {
  const [filter, setFilter] = useState('all');

  const filteredEntries = pendingEntries.filter(entry => {
    if (filter === 'all') return true;
    return entry.status === filter;
  });

  return (
    <div className="pending-income mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold" style={{color: '#1f2937'}}>Pending Income</h2>
        
        <div className="flex space-x-2">
          {['all', 'pending', 'processing'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === status ? 'text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              style={filter === status ? {background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'} : {}}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
          border: '1px solid rgba(31, 41, 55, 0.08)'
        }}>
          <DollarSign className="w-16 h-16 mx-auto mb-4" style={{color: '#9ca3af'}} />
          <p style={{color: '#64748b'}}>No pending income</p>
          <p className="text-sm mt-2" style={{color: '#9ca3af'}}>Your earnings will appear here when added by admin</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map(entry => (
            <div 
              key={entry.id} 
              className="p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
                border: '1px solid rgba(31, 41, 55, 0.08)'
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Music className="w-5 h-5" style={{color: '#1f2937'}} />
                    <h3 className="font-semibold" style={{color: '#1f2937'}}>
                      {entry.releases?.title || 'Unknown Release'}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      entry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      entry.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      entry.status === 'paid' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {entry.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p style={{color: '#9ca3af'}}>Platform</p>
                      <p style={{color: '#64748b'}}>{entry.platform}</p>
                    </div>
                    <div>
                      <p style={{color: '#9ca3af'}}>Territory</p>
                      <p style={{color: '#64748b'}}>{entry.territory}</p>
                    </div>
                    <div>
                      <p style={{color: '#9ca3af'}}>Type</p>
                      <p style={{color: '#64748b'}}>{entry.earning_type}</p>
                    </div>
                    <div>
                      <p style={{color: '#9ca3af'}}>Expected</p>
                      <p style={{color: '#64748b'}}>
                        {entry.expected_payment_date ? new Date(entry.expected_payment_date).toLocaleDateString() : 'TBD'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-3xl font-bold" style={{color: '#1f2937'}}>
                    {entry.currency}{entry.amount?.toFixed(2)}
                  </p>
                  <p className="text-sm" style={{color: '#9ca3af'}}>
                    {entry.period_start && entry.period_end 
                      ? `${new Date(entry.period_start).toLocaleDateString()} - ${new Date(entry.period_end).toLocaleDateString()}`
                      : 'No period specified'
                    }
                  </p>
                </div>
              </div>
              
              {entry.notes && (
                <div className="mt-4 pt-4 border-t" style={{borderColor: 'rgba(31, 41, 55, 0.08)'}}>
                  <p className="text-sm" style={{color: '#64748b'}}>{entry.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
