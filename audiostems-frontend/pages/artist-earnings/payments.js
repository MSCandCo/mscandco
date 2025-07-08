import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import MainLayout from "@/components/layouts/mainLayout";
import SEO from "@/components/seo";
import { Card, Button, Badge, Modal, TextInput, Label, Select, Table, Alert } from "flowbite-react";
import { 
  HiBanknotes,
  HiCreditCard,
  HiDownload,
  HiEye,
  HiCalendar,
  HiCheckCircle,
  HiClock,
  HiXCircle,
  HiCog,
  HiShieldCheck,
  HiCurrencyPound,
  HiTrendingUp,
  HiDocumentText
} from "lucide-react";
import useSWR from "swr";
import { apiRoute } from "@/lib/utils";

function Payments() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showBankModal, setShowBankModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [bankFormData, setBankFormData] = useState({
    accountHolderName: '',
    accountNumber: '',
    sortCode: '',
    bankName: '',
    accountType: 'checking'
  });

  // Check if user is artist
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.userRole !== "artist") {
      router.push("/");
    }
  }, [session, status, router]);

  const { data: paymentHistory } = useSWR(
    apiRoute("/monthly-statements/payment-history")
  );

  const { data: user } = useSWR(
    session ? apiRoute(`/users/me`) : null
  );

  if (status === "loading") {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (!session || session.user?.userRole !== "artist") {
    return null;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'failure';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processed':
        return <HiCheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <HiClock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <HiXCircle className="h-4 w-4 text-red-500" />;
      default:
        return <HiClock className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleBankFormSubmit = async (e) => {
    e.preventDefault();
    // In production, this would submit to the API
    console.log('Bank details submitted:', bankFormData);
    setShowBankModal(false);
  };

  const handlePaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const paymentHistoryData = paymentHistory?.data || [];
  const totalProcessed = paymentHistory?.totalProcessed || 0;
  const pendingAmount = paymentHistory?.pendingAmount || 0;

  return (
    <MainLayout>
      <SEO title="Payments & Banking" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Payments & Banking</h1>
              <p className="text-gray-600">Manage your payment methods and view payment history</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button color="blue" onClick={() => setShowBankModal(true)}>
                <HiCog className="mr-2 h-4 w-4" />
                Update Banking
              </Button>
              <Button color="gray">
                <HiDownload className="mr-2 h-4 w-4" />
                Export History
              </Button>
            </div>
          </div>
        </div>

        {/* Payment Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-green-500">
            <div className="flex items-center">
              <HiCheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Processed</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalProcessed)}</p>
                <p className="text-sm text-gray-600">All time payments</p>
              </div>
            </div>
          </Card>
          
          <Card className="border-l-4 border-l-yellow-500">
            <div className="flex items-center">
              <HiClock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(pendingAmount)}</p>
                <p className="text-sm text-gray-600">Next payment cycle</p>
              </div>
            </div>
          </Card>
          
          <Card className="border-l-4 border-l-blue-500">
            <div className="flex items-center">
              <HiCalendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Next Payment</p>
                <p className="text-lg font-bold text-gray-900">August 1, 2024</p>
                <p className="text-sm text-gray-600">Monthly schedule</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Banking Information */}
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Banking Information</h3>
            <Button size="sm" color="blue" onClick={() => setShowBankModal(true)}>
              <HiCog className="mr-2 h-4 w-4" />
              Update Details
            </Button>
          </div>
          
          {user?.bankDetails ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Account Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Account Holder:</span>
                    <span className="font-medium">{user.bankDetails.accountHolderName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Account Number:</span>
                    <span className="font-medium">****{user.bankDetails.accountNumber?.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sort Code:</span>
                    <span className="font-medium">{user.bankDetails.sortCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bank Name:</span>
                    <span className="font-medium">{user.bankDetails.bankName}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Payment Preferences</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Payment Method:</span>
                    <span className="font-medium">Bank Transfer</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Currency:</span>
                    <span className="font-medium">GBP (£)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Min Payout:</span>
                    <span className="font-medium">£50.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Schedule:</span>
                    <span className="font-medium">Monthly</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Alert color="warning">
              <div className="flex items-center">
                <HiShieldCheck className="mr-2 h-4 w-4" />
                <span>No banking details configured. Please add your bank details to receive payments.</span>
              </div>
            </Alert>
          )}
        </Card>

        {/* Payment History */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Payment History</h3>
            <Button size="sm" color="gray">
              <HiDownload className="mr-2 h-4 w-4" />
              Export All
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <Table.Head>
                <Table.HeadCell>Date</Table.HeadCell>
                <Table.HeadCell>Amount</Table.HeadCell>
                <Table.HeadCell>Method</Table.HeadCell>
                <Table.HeadCell>Reference</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {paymentHistoryData.map((payment) => (
                  <Table.Row key={payment.id} className="hover:bg-gray-50">
                    <Table.Cell className="font-medium">
                      {formatDate(payment.date)}
                    </Table.Cell>
                    <Table.Cell className="font-semibold">
                      {formatCurrency(payment.amount)}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center">
                        <HiBanknotes className="mr-2 h-4 w-4 text-gray-400" />
                        {payment.method === 'bank_transfer' ? 'Bank Transfer' : payment.method}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-gray-600">{payment.reference}</span>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={getStatusColor(payment.status)}>
                        <div className="flex items-center">
                          {getStatusIcon(payment.status)}
                          <span className="ml-1 capitalize">{payment.status}</span>
                        </div>
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex space-x-2">
                        <Button size="sm" color="gray" onClick={() => handlePaymentDetails(payment)}>
                          <HiEye className="mr-1 h-3 w-3" />
                          Details
                        </Button>
                        <Button size="sm" color="gray">
                          <HiDownload className="mr-1 h-3 w-3" />
                          Receipt
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </Card>

        {/* Payment Schedule */}
        <Card className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Payment Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Upcoming Payments</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">July 2024 Earnings</p>
                    <p className="text-sm text-gray-600">Processing on August 1, 2024</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(1350.80)}</p>
                    <Badge color="warning">Pending</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">August 2024 Earnings</p>
                    <p className="text-sm text-gray-600">Processing on September 1, 2024</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">TBD</p>
                    <Badge color="gray">Calculating</Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Payment Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Payment Frequency</span>
                  <span className="font-medium">Monthly</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Minimum Payout</span>
                  <span className="font-medium">£50.00</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Payment Method</span>
                  <span className="font-medium">Bank Transfer</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Currency</span>
                  <span className="font-medium">GBP (£)</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Bank Details Modal */}
        <Modal show={showBankModal} onClose={() => setShowBankModal(false)} size="4xl">
          <Modal.Header>
            <div className="flex items-center">
              <HiBanknotes className="mr-2 h-5 w-5" />
              Banking & Payment Details
            </div>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleBankFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Bank Account Information</h4>
                  
                  <div>
                    <Label htmlFor="accountHolder">Account Holder Name *</Label>
                    <TextInput
                      id="accountHolder"
                      required
                      value={bankFormData.accountHolderName}
                      onChange={(e) => setBankFormData({...bankFormData, accountHolderName: e.target.value})}
                      placeholder="Enter account holder name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="accountNumber">Account Number *</Label>
                    <TextInput
                      id="accountNumber"
                      type="password"
                      required
                      value={bankFormData.accountNumber}
                      onChange={(e) => setBankFormData({...bankFormData, accountNumber: e.target.value})}
                      placeholder="Enter account number"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="sortCode">Sort Code *</Label>
                    <TextInput
                      id="sortCode"
                      required
                      value={bankFormData.sortCode}
                      onChange={(e) => setBankFormData({...bankFormData, sortCode: e.target.value})}
                      placeholder="Enter sort code"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bankName">Bank Name *</Label>
                    <TextInput
                      id="bankName"
                      required
                      value={bankFormData.bankName}
                      onChange={(e) => setBankFormData({...bankFormData, bankName: e.target.value})}
                      placeholder="Enter bank name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="accountType">Account Type</Label>
                    <Select
                      id="accountType"
                      value={bankFormData.accountType}
                      onChange={(e) => setBankFormData({...bankFormData, accountType: e.target.value})}
                    >
                      <option value="checking">Checking</option>
                      <option value="savings">Savings</option>
                      <option value="business">Business</option>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Payment Preferences</h4>
                  
                  <div>
                    <Label htmlFor="paymentMethod">Preferred Payment Method</Label>
                    <Select id="paymentMethod" defaultValue="bank_transfer">
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="paypal">PayPal</option>
                      <option value="stripe">Stripe</option>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="payoutThreshold">Minimum Payout Threshold</Label>
                    <TextInput
                      id="payoutThreshold"
                      type="number"
                      placeholder="50"
                      defaultValue="50"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="currency">Preferred Currency</Label>
                    <Select id="currency" defaultValue="GBP">
                      <option value="GBP">GBP (£)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="CAD">CAD (C$)</option>
                      <option value="AUD">AUD (A$)</option>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="taxId">Tax ID / SSN</Label>
                    <TextInput
                      id="taxId"
                      type="password"
                      placeholder="For tax reporting purposes"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Billing Address</Label>
                    <TextInput
                      id="address"
                      placeholder="Enter billing address"
                    />
                  </div>
                </div>
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => setShowBankModal(false)} color="gray">Cancel</Button>
            <Button type="submit" color="blue" onClick={handleBankFormSubmit}>Save Banking Details</Button>
          </Modal.Footer>
        </Modal>

        {/* Payment Details Modal */}
        <Modal show={showPaymentModal} onClose={() => setShowPaymentModal(false)}>
          <Modal.Header>
            <div className="flex items-center">
              <HiDocumentText className="mr-2 h-5 w-5" />
              Payment Details
            </div>
          </Modal.Header>
          <Modal.Body>
            {selectedPayment && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Payment Date</p>
                    <p className="font-semibold">{formatDate(selectedPayment.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Amount</p>
                    <p className="font-semibold">{formatCurrency(selectedPayment.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <Badge color={getStatusColor(selectedPayment.status)}>
                      {selectedPayment.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Method</p>
                    <p className="font-semibold">{selectedPayment.method}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Reference</p>
                  <p className="font-semibold">{selectedPayment.reference}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Description</p>
                  <p className="font-semibold">{selectedPayment.description}</p>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => setShowPaymentModal(false)} color="gray">Close</Button>
            <Button color="blue">
              <HiDownload className="mr-2 h-4 w-4" />
              Download Receipt
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </MainLayout>
  );
}

export default Payments; 