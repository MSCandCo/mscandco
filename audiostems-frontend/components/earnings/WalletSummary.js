export default function WalletSummary({ wallet }) {
  const handleRequestPayout = async () => {
    if (wallet.available_balance < wallet.minimum_payout) {
      // Show warning using MSC brand style
      const warningDiv = document.createElement('div');
      warningDiv.innerHTML = `
        <div style="
          position: fixed; 
          top: 20px; 
          right: 20px; 
          background: #fef3c7; 
          border-left: 4px solid #d97706; 
          padding: 16px 24px; 
          color: #78350f; 
          border-radius: 8px; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 1000;
        ">
          Minimum payout is ${wallet.currency}${wallet.minimum_payout}
        </div>
      `;
      document.body.appendChild(warningDiv);
      setTimeout(() => document.body.removeChild(warningDiv), 4000);
      return;
    }

    // Open payout modal
    const amount = prompt(`Enter amount to withdraw (Available: ${wallet.currency}${wallet.available_balance}):`);
    if (!amount) return;

    const response = await fetch('/api/artist/request-payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: parseFloat(amount),
        payout_method: wallet.payout_method
      })
    });

    if (response.ok) {
      // Show success notification using MSC brand style
      const successDiv = document.createElement('div');
      successDiv.innerHTML = `
        <div style="
          position: fixed; 
          top: 20px; 
          right: 20px; 
          background: #f0fdf4; 
          border-left: 4px solid #065f46; 
          padding: 16px 24px; 
          color: #065f46; 
          border-radius: 8px; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 1000;
        ">
          Payout requested successfully!
        </div>
      `;
      document.body.appendChild(successDiv);
      setTimeout(() => document.body.removeChild(successDiv), 3000);
      
      window.location.reload();
    }
  };

  return (
    <div className="wallet-summary grid grid-cols-4 gap-4 mb-8">
      <div className="wallet-card text-white p-6 rounded-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{
        background: 'linear-gradient(145deg, #1f2937 0%, #0f172a 100%)'
      }}>
        <h3 className="text-sm opacity-80">Available Balance</h3>
        <h1 className="text-4xl font-bold">{wallet.currency}{wallet.available_balance?.toFixed(2)}</h1>
        <p className="text-sm mt-2">Ready for withdrawal</p>
        <button 
          onClick={handleRequestPayout}
          className="mt-4 bg-white px-4 py-2 rounded transition-all"
          style={{color: '#1f2937'}}
        >
          Request Payout
        </button>
      </div>

      <div className="wallet-card p-6 rounded-lg shadow transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
        border: '1px solid rgba(31, 41, 55, 0.08)'
      }}>
        <h3 className="text-sm" style={{color: '#64748b'}}>Pending Income</h3>
        <h2 className="text-3xl font-bold" style={{color: '#1f2937'}}>{wallet.currency}{wallet.pending_balance?.toFixed(2)}</h2>
        <p className="text-sm mt-2" style={{color: '#9ca3af'}}>Expected: {wallet.next_payout_date || 'TBD'}</p>
      </div>

      <div className="wallet-card p-6 rounded-lg shadow transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
        border: '1px solid rgba(31, 41, 55, 0.08)'
      }}>
        <h3 className="text-sm" style={{color: '#64748b'}}>Processing</h3>
        <h2 className="text-3xl font-bold" style={{color: '#1f2937'}}>{wallet.currency}{wallet.processing_balance?.toFixed(2)}</h2>
        <p className="text-sm mt-2" style={{color: '#9ca3af'}}>Being calculated</p>
      </div>

      <div className="wallet-card p-6 rounded-lg shadow transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
        border: '1px solid rgba(31, 41, 55, 0.08)'
      }}>
        <h3 className="text-sm" style={{color: '#64748b'}}>Total Earned</h3>
        <h2 className="text-3xl font-bold" style={{color: '#1f2937'}}>{wallet.currency}{wallet.total_earned?.toFixed(2)}</h2>
        <p className="text-sm mt-2" style={{color: '#9ca3af'}}>All time</p>
      </div>

      {wallet.held_balance > 0 && (
        <div className="col-span-4 p-4 rounded" style={{
          background: '#fef3c7',
          border: '1px solid #fbbf24',
          borderLeft: '4px solid #d97706'
        }}>
          <p style={{color: '#78350f'}}>
            {wallet.currency}{wallet.held_balance} on hold - Contact support for details
          </p>
        </div>
      )}
    </div>
  );
}
