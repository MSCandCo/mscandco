import { useState, useEffect } from 'react';
import { Clock, Calendar, CreditCard, AlertCircle, CheckCircle, X } from 'lucide-react';
import { formatCurrency } from '../shared/CurrencySelector';

export default function RenewalNotification({ 
  subscriptionStatus, 
  walletBalance = 0, 
  showOnDashboard = false,
  showOnBilling = false
}) {
  // Don't show if no subscription
  if (!subscriptionStatus?.hasSubscription) {
    return null;
  }

  const {
    planName,
    billingCycle,
    amount,
    currency = 'GBP',
    renewalDateFormatted,
    daysUntilRenewal,
    autoRenew
  } = subscriptionStatus;

  // Don't show if no renewal date
  if (!renewalDateFormatted || !autoRenew) {
    return null;
  }

  // Determine notification type and styling
  const hasInsufficientFunds = walletBalance < (amount || 0);
  const isRenewalSoon = daysUntilRenewal <= 7;
  const isRenewalToday = daysUntilRenewal === 0;
  const isRenewalOverdue = daysUntilRenewal < 0;

  let notificationType = 'info';
  let bgColor = 'bg-blue-50';
  let borderColor = 'border-blue-200';
  let textColor = 'text-blue-800';
  let iconColor = 'text-blue-600';
  let icon = Calendar;

  if (isRenewalOverdue) {
    notificationType = 'error';
    bgColor = 'bg-red-50';
    borderColor = 'border-red-200';
    textColor = 'text-red-800';
    iconColor = 'text-red-600';
    icon = AlertCircle;
  } else if (hasInsufficientFunds) {
    notificationType = 'warning';
    bgColor = 'bg-yellow-50';
    borderColor = 'border-yellow-200';
    textColor = 'text-yellow-800';
    iconColor = 'text-yellow-600';
    icon = CreditCard;
  } else if (isRenewalToday) {
    notificationType = 'info';
    bgColor = 'bg-blue-50';
    borderColor = 'border-blue-200';
    textColor = 'text-blue-800';
    iconColor = 'text-blue-600';
    icon = Clock;
  } else if (isRenewalSoon) {
    notificationType = 'success';
    bgColor = 'bg-green-50';
    borderColor = 'border-green-200';
    textColor = 'text-green-800';
    iconColor = 'text-green-600';
    icon = CheckCircle;
  }

  // Generate notification message
  const getNotificationMessage = () => {
    const formattedAmount = formatCurrency(amount || 0, currency);
    
    if (isRenewalOverdue) {
      return {
        title: 'Subscription Renewal Overdue',
        message: `Your ${planName} subscription renewal was due ${Math.abs(daysUntilRenewal)} day${Math.abs(daysUntilRenewal) !== 1 ? 's' : ''} ago. Please update your payment method.`
      };
    }
    
    if (hasInsufficientFunds) {
      const shortfall = formatCurrency((amount || 0) - walletBalance, currency);
      return {
        title: 'Insufficient Funds for Renewal',
        message: `Your ${planName} subscription will renew on ${renewalDateFormatted}. Add ${shortfall} to your wallet to avoid service interruption.`
      };
    }
    
    if (isRenewalToday) {
      return {
        title: 'Subscription Renewing Today',
        message: `Your ${planName} subscription will automatically renew today. ${formattedAmount} will be deducted from your wallet.`
      };
    }
    
    if (isRenewalSoon) {
      return {
        title: 'Upcoming Subscription Renewal',
        message: `Your ${planName} subscription will automatically renew in ${daysUntilRenewal} day${daysUntilRenewal !== 1 ? 's' : ''} on ${renewalDateFormatted}. ${formattedAmount} will be deducted from your wallet.`
      };
    }
    
    // Default renewal notification
    return {
      title: 'Subscription Auto-Renewal Active',
      message: `Your ${planName} subscription will automatically renew on ${renewalDateFormatted}. ${formattedAmount} will be deducted from your wallet.`
    };
  };

  const { title, message } = getNotificationMessage();
  const IconComponent = icon;

  // Auto-renewal notifications are persistent and cannot be dismissed

  return (
    <div className={`${bgColor} ${borderColor} border rounded-lg p-4 mb-4`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 ${iconColor}`}>
            <IconComponent className="w-5 h-5 mt-0.5" />
          </div>
          <div className="flex-1">
            <h4 className={`text-sm font-semibold ${textColor}`}>
              {title}
            </h4>
            <p className={`text-sm mt-1 ${textColor.replace('800', '700')}`}>
              {message}
            </p>
            
            {/* Additional details for dashboard */}
            {showOnDashboard && (
              <div className="mt-2 flex flex-wrap gap-4 text-xs">
                <span className={`${textColor.replace('800', '600')}`}>
                  <strong>Plan:</strong> {planName}
                </span>
                <span className={`${textColor.replace('800', '600')}`}>
                  <strong>Billing:</strong> {billingCycle}
                </span>
                <span className={`${textColor.replace('800', '600')}`}>
                  <strong>Amount:</strong> {formatCurrency(amount || 0, currency)}
                </span>
              </div>
            )}

            {/* Action buttons for billing page */}
            {showOnBilling && hasInsufficientFunds && (
              <div className="mt-3">
                <a
                  href="/billing"
                  className="inline-flex items-center px-3 py-1 text-xs font-medium bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                >
                  <CreditCard className="w-3 h-3 mr-1" />
                  Add Funds
                </a>
              </div>
            )}
          </div>
        </div>
        
        {/* No dismiss button - auto-renewal notifications cannot be closed */}
      </div>
    </div>
  );
}

// Helper component for dashboard integration
export function DashboardRenewalNotification({ subscriptionStatus, walletBalance }) {
  return (
    <RenewalNotification
      subscriptionStatus={subscriptionStatus}
      walletBalance={walletBalance}
      showOnDashboard={true}
    />
  );
}

// Helper component for billing page integration
export function BillingRenewalNotification({ subscriptionStatus, walletBalance }) {
  return (
    <RenewalNotification
      subscriptionStatus={subscriptionStatus}
      walletBalance={walletBalance}
      showOnBilling={true}
    />
  );
}
