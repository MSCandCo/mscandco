import { useState } from 'react';
import { X, CreditCard, Building, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

export default function PayoutRequestModal({ 
  isOpen, 
  onClose, 
  availableBalance = 0, 
  minimumPayout = 50, 
  onSuccess 
}) {
  const [formData, setFormData] = useState({
    amount: '',
    payout_method: 'bank_transfer',
    bank_details: {
      account_name: '',
      account_number: '',
      sort_code: '',
      bank_name: ''
    },
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const payoutMethods = [
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: Building,
      description: 'Direct transfer to your bank account (1-3 business days)',
      fields: ['account_name', 'account_number', 'sort_code', 'bank_name']
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: CreditCard,
      description: 'Transfer to your PayPal account (Instant)',
      fields: ['paypal_email']
    }
  ];

  const selectedMethod = payoutMethods.find(m => m.id === formData.payout_method);

  const validateForm = () => {
    const newErrors = {};

    // Amount validation
    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount)) {
      newErrors.amount = 'Amount is required';
    } else if (amount < minimumPayout) {
      newErrors.amount = `Minimum payout is £${minimumPayout}`;
    } else if (amount > availableBalance) {
      newErrors.amount = `Amount exceeds available balance (£${availableBalance.toFixed(2)})`;
    }

    // Method-specific validation
    if (formData.payout_method === 'bank_transfer') {
      if (!formData.bank_details.account_name?.trim()) {
        newErrors.account_name = 'Account name is required';
      }
      if (!formData.bank_details.account_number?.trim()) {
        newErrors.account_number = 'Account number is required';
      }
      if (!formData.bank_details.sort_code?.trim()) {
        newErrors.sort_code = 'Sort code is required';
      }
    } else if (formData.payout_method === 'paypal') {
      if (!formData.bank_details.paypal_email?.trim()) {
        newErrors.paypal_email = 'PayPal email is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const response = await fetch('/api/artist/request-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artist_id: '0a060de5-1c94-4060-a1c2-860224fc348d', // TODO: Get from auth context
          amount: parseFloat(formData.amount),
          payout_method: formData.payout_method,
          bank_details: formData.bank_details,
          notes: formData.notes
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Show success notification
        const notification = document.createElement('div');
        notification.innerHTML = `
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 20px; height: 20px; border-radius: 50%; background: #065f46; display: flex; align-items: center; justify-content: center;">
              <svg style="width: 12px; height: 12px; fill: white;" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
              </svg>
            </div>
            <div>
              <div style="font-weight: 600; margin-bottom: 4px;">Payout Request Submitted</div>
              <div style="font-size: 14px; opacity: 0.9;">Your request for £${formData.amount} will be processed within 2-3 business days.</div>
            </div>
          </div>
        `;
        notification.style.cssText = `
          position: fixed; top: 20px; right: 20px; z-index: 1001;
          background: #f0fdf4; border-left: 4px solid #065f46; color: #065f46;
          padding: 16px 20px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          min-width: 350px; max-width: 400px; animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);

        onSuccess?.(result.request);
        onClose();
        
        // Reset form
        setFormData({
          amount: '',
          payout_method: 'bank_transfer',
          bank_details: {
            account_name: '',
            account_number: '',
            sort_code: '',
            bank_name: ''
          },
          notes: ''
        });
      } else {
        throw new Error(result.error || 'Failed to submit payout request');
      }
    } catch (error) {
      console.error('Error submitting payout request:', error);
      
      // Show error notification
      const notification = document.createElement('div');
      notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 20px; height: 20px; border-radius: 50%; background: #991b1b; display: flex; align-items: center; justify-content: center;">
            <svg style="width: 12px; height: 12px; fill: white;" viewBox="0 0 20 20">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
            </svg>
          </div>
          <div>
            <div style="font-weight: 600; margin-bottom: 4px;">Payout Request Failed</div>
            <div style="font-size: 14px; opacity: 0.9;">${error.message}</div>
          </div>
        </div>
      `;
      notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 1001;
        background: #fef2f2; border-left: 4px solid #991b1b; color: #991b1b;
        padding: 16px 20px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        min-width: 350px; max-width: 400px; animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold" style={{color: '#1f2937'}}>Request Payout</h2>
            <p className="text-sm mt-1" style={{color: '#64748b'}}>
              Available balance: <span className="font-semibold">£{availableBalance.toFixed(2)}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-all"
          >
            <X className="w-5 h-5" style={{color: '#64748b'}} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: '#374151'}}>
              Payout Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{color: '#64748b'}} />
              <input
                type="number"
                step="0.01"
                min={minimumPayout}
                max={availableBalance}
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className={`w-full pl-10 pr-3 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                  errors.amount ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="50.00"
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm" style={{color: '#991b1b'}}>{errors.amount}</p>
            )}
            <p className="mt-1 text-xs" style={{color: '#64748b'}}>
              Minimum payout: £{minimumPayout} • Available: £{availableBalance.toFixed(2)}
            </p>
          </div>

          {/* Payout Method */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{color: '#374151'}}>
              Payout Method
            </label>
            <div className="grid grid-cols-1 gap-3">
              {payoutMethods.map(method => {
                const Icon = method.icon;
                return (
                  <label
                    key={method.id}
                    className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                      formData.payout_method === method.id
                        ? 'border-slate-500 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payout_method"
                      value={method.id}
                      checked={formData.payout_method === method.id}
                      onChange={(e) => setFormData({...formData, payout_method: e.target.value})}
                      className="sr-only"
                    />
                    <Icon className="w-5 h-5 mt-0.5 mr-3" style={{color: '#64748b'}} />
                    <div className="flex-1">
                      <div className="font-medium" style={{color: '#1f2937'}}>{method.name}</div>
                      <div className="text-sm" style={{color: '#64748b'}}>{method.description}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Method-specific fields */}
          {selectedMethod && (
            <div className="space-y-4">
              <h4 className="font-medium" style={{color: '#374151'}}>{selectedMethod.name} Details</h4>
              
              {selectedMethod.id === 'bank_transfer' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{color: '#374151'}}>
                      Account Name
                    </label>
                    <input
                      type="text"
                      value={formData.bank_details.account_name || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        bank_details: { ...formData.bank_details, account_name: e.target.value }
                      })}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                        errors.account_name ? 'border-red-300' : 'border-slate-300'
                      }`}
                      placeholder="John Smith"
                    />
                    {errors.account_name && (
                      <p className="mt-1 text-sm" style={{color: '#991b1b'}}>{errors.account_name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{color: '#374151'}}>
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={formData.bank_details.bank_name || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        bank_details: { ...formData.bank_details, bank_name: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      placeholder="Barclays Bank"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{color: '#374151'}}>
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={formData.bank_details.account_number || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        bank_details: { ...formData.bank_details, account_number: e.target.value }
                      })}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                        errors.account_number ? 'border-red-300' : 'border-slate-300'
                      }`}
                      placeholder="12345678"
                    />
                    {errors.account_number && (
                      <p className="mt-1 text-sm" style={{color: '#991b1b'}}>{errors.account_number}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{color: '#374151'}}>
                      Sort Code
                    </label>
                    <input
                      type="text"
                      value={formData.bank_details.sort_code || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        bank_details: { ...formData.bank_details, sort_code: e.target.value }
                      })}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                        errors.sort_code ? 'border-red-300' : 'border-slate-300'
                      }`}
                      placeholder="12-34-56"
                    />
                    {errors.sort_code && (
                      <p className="mt-1 text-sm" style={{color: '#991b1b'}}>{errors.sort_code}</p>
                    )}
                  </div>
                </div>
              )}
              
              {selectedMethod.id === 'paypal' && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{color: '#374151'}}>
                    PayPal Email
                  </label>
                  <input
                    type="email"
                    value={formData.bank_details.paypal_email || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      bank_details: { ...formData.bank_details, paypal_email: e.target.value }
                    })}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                      errors.paypal_email ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="john@example.com"
                  />
                  {errors.paypal_email && (
                    <p className="mt-1 text-sm" style={{color: '#991b1b'}}>{errors.paypal_email}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: '#374151'}}>
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              placeholder="Additional information for your payout request..."
            />
          </div>

          {/* Info Banner */}
          <div className="flex items-start p-4 rounded-lg" style={{background: '#f1f5f9', border: '1px solid #cbd5e1'}}>
            <AlertCircle className="w-5 h-5 mt-0.5 mr-3" style={{color: '#475569'}} />
            <div className="text-sm" style={{color: '#475569'}}>
              <div className="font-medium mb-1">Processing Time</div>
              <div>Bank transfers typically take 1-3 business days to process. You'll receive an email confirmation once your payout has been sent.</div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-2 px-6 py-2 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'}}
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <DollarSign className="w-4 h-4" />
              )}
              <span>{submitting ? 'Submitting...' : 'Request Payout'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

