import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const BiddingSystem = ({ produceId, currentPrice = 0 }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [auctionStatus, setAuctionStatus] = useState('active');
  const [timeLeft, setTimeLeft] = useState('');
  const [farmerRazorpayKey, setFarmerRazorpayKey] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingBidAmount, setPendingBidAmount] = useState(0);
  const [distributorInfo, setDistributorInfo] = useState({
    company_name: '',
    contact_person: '',
    phone: '',
    email: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    if (produceId && user) {
      fetchBids();
      fetchAuctionStatus();
      fetchFarmerPaymentConfig();
      subscribeToBids();
      startTimer();
    }

    return () => {
      // Cleanup subscription
      if (window.bidSubscription) {
        window.bidSubscription.unsubscribe();
      }
    };
  }, [produceId, user]);

  const fetchBids = async () => {
    try {
      const { data, error } = await supabase
        .from('distributor_bids')
        .select(`
          *,
          distributors:distributor_id (
            company_name,
            user_id
          )
        `)
        .eq('produce_id', produceId)
        .eq('is_active', true)
        .order('bid_amount', { ascending: false });

      if (error) throw error;
      setBids(data || []);
    } catch (error) {
      console.error('Error fetching bids:', error);
    }
  };

  const fetchAuctionStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('produce_auctions')
        .select('*')
        .eq('produce_id', produceId)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      if (data) {
        setAuctionStatus(data.status);
        calculateTimeLeft(data.end_time);
      }
    } catch (error) {
      console.error('Error fetching auction status:', error);
    }
  };

  const fetchFarmerPaymentConfig = async () => {
    try {
      // Get the produce farmer's Razorpay key
      const { data: produce, error: produceError } = await supabase
        .from('farmer_listings')
        .select('user_id')
        .eq('id', produceId)
        .single();

      if (produceError) throw produceError;

      const { data: paymentConfig, error: configError } = await supabase
        .from('payment_configurations')
        .select('razorpay_key_id')
        .eq('seller_id', produce.user_id)
        .eq('is_active', true)
        .single();

      if (configError) throw configError;
      if (paymentConfig) {
        setFarmerRazorpayKey(paymentConfig.razorpay_key_id);
      }
    } catch (error) {
      console.error('Error fetching farmer payment config:', error);
    }
  };

  const subscribeToBids = () => {
    window.bidSubscription = supabase
      .channel(`bids-${produceId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'distributor_bids',
          filter: `produce_id=eq.${produceId}`
        }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setBids(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setBids(prev => prev.map(bid => 
              bid.id === payload.new.id ? payload.new : bid
            ));
          }
        }
      )
      .subscribe();
  };

  const startTimer = () => {
    const timer = setInterval(() => {
      // This will be updated with actual auction end time
      // For now, just show a placeholder
      setTimeLeft('Auction Active');
    }, 1000);

    return () => clearInterval(timer);
  };

  const calculateTimeLeft = (endTime) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const difference = end - now;

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    } else {
      setTimeLeft('Auction Ended');
      setAuctionStatus('ended');
    }
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate bid amount
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= currentPrice) {
      setError('Bid amount must be higher than current price');
      return;
    }

    // Validate distributor info
    if (!distributorInfo.company_name || !distributorInfo.contact_person || !distributorInfo.phone) {
      setError('Please fill in all required fields: Company Name, Contact Person, and Phone');
      return;
    }

    // Check if farmer has configured payment settings
    if (!farmerRazorpayKey) {
      setError('Farmer has not configured payment settings. Please contact them.');
      return;
    }

    // Store the bid amount and show payment modal
    setPendingBidAmount(amount);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (response) => {
    try {
      setLoading(true);
      
      // Process the bid after successful payment
      const { data, error } = await supabase.functions.invoke('process-produce-bid', {
        body: {
          produce_id: produceId,
          bid_amount: pendingBidAmount,
          card_token: response.razorpay_payment_id,
          distributor_info: distributorInfo
        }
      });

      if (error) throw error;

      if (data.success) {
        setSuccess('Bid placed successfully! Your card details have been securely stored.');
        setBidAmount('');
        setDistributorInfo({ company_name: '', contact_person: '', phone: '', email: '' });
        setShowPaymentModal(false);
        fetchBids(); // Refresh bids
      } else {
        setError(data.error || 'Failed to place bid');
      }
    } catch (error) {
      setError('Failed to process bid. Please try again.');
      console.error('Bid processing error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentFailure = (error) => {
    setError('Payment failed. Please try again with a different card.');
    setShowPaymentModal(false);
    console.error('Payment error:', error);
  };

  const openRazorpayPayment = () => {
    if (!farmerRazorpayKey) {
      setError('Payment gateway not configured');
      return;
    }

    const options = {
      key: farmerRazorpayKey,
      amount: Math.round(pendingBidAmount * 100), // Convert to paise
      currency: 'INR',
      name: 'Agriculture Produce Auction',
      description: `Bid for Produce - ₹${pendingBidAmount}`,
      handler: handlePaymentSuccess,
      modal: {
        ondismiss: () => {
          setShowPaymentModal(false);
        }
      },
      prefill: {
        name: distributorInfo.contact_person || user?.user_metadata?.full_name || '',
        email: distributorInfo.email || user?.email || '',
        contact: distributorInfo.phone || ''
      },
      theme: {
        color: '#10B981'
      },
      notes: {
        "Bid Amount": `₹${pendingBidAmount}`,
        "Produce ID": produceId,
        "Company": distributorInfo.company_name
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', handlePaymentFailure);
      rzp.open();
    } catch (error) {
      setError('Failed to initialize payment. Please try again.');
      console.error('Payment initialization error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDistributorInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (auctionStatus === 'ended') {
    return (
      <div className="bg-gray-100 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Auction Ended</h3>
        <p className="text-gray-600">This auction has ended. Check back for results.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Live Produce Bidding</h3>
        <div className="flex justify-between items-center">
          <p className="text-lg text-gray-600">
            Current Price: <span className="font-semibold text-green-600">{formatCurrency(currentPrice)}</span>
          </p>
          <div className="text-sm text-gray-500">
            Time Left: <span className="font-medium">{timeLeft}</span>
          </div>
        </div>
      </div>

      {/* Bid Form with Distributor Info */}
      <form onSubmit={handleBidSubmit} className="mb-6">
        {/* Distributor Information */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Your Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                id="company_name"
                name="company_name"
                value={distributorInfo.company_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your company name"
                required
              />
            </div>
            <div>
              <label htmlFor="contact_person" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person *
              </label>
              <input
                type="text"
                id="contact_person"
                name="contact_person"
                value={distributorInfo.contact_person}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter contact person name"
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={distributorInfo.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter phone number"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={distributorInfo.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>
          </div>
        </div>

        {/* Bid Amount */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-2">
              Your Bid Amount (₹)
            </label>
            <input
              type="number"
              id="bidAmount"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              min={currentPrice + 1}
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Enter amount above ${formatCurrency(currentPrice)}`}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !bidAmount || parseFloat(bidAmount) <= currentPrice}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processing...' : 'Place Bid'}
          </button>
        </div>
      </form>

      {/* Error and Success Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Live Bids */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Live Bids</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {bids.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No bids yet. Be the first to bid!</p>
          ) : (
            bids.map((bid) => (
              <div key={bid.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium text-gray-800">
                    {bid.distributors?.company_name || 'Anonymous'}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    {new Date(bid.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <span className="font-semibold text-green-600">
                  {formatCurrency(bid.bid_amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Complete Your Bid</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Bid Amount: <span className="font-semibold text-green-600">{formatCurrency(pendingBidAmount)}</span>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Please provide your card details to complete this bid. Your card will only be charged if you win the auction.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={openRazorpayPayment}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
                >
                  {loading ? 'Processing...' : 'Proceed to Payment'}
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="mt-3 px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiddingSystem;
