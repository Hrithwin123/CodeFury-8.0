import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const AuctionManagement = ({ produceId, produceName }) => {
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    start_time: '',
    end_time: '',
    reserve_price: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    if (produceId) {
      fetchAuctionStatus();
    }
  }, [produceId]);

  const fetchAuctionStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('produce_auctions')
        .select('*')
        .eq('produce_id', produceId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      setAuction(data);
    } catch (error) {
      console.error('Error fetching auction status:', error);
    }
  };

  const handleCreateAuction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form data
      const startTime = new Date(formData.start_time);
      const endTime = new Date(formData.end_time);
      const now = new Date();

      if (startTime <= now) {
        setError('Start time must be in the future');
        setLoading(false);
        return;
      }

      if (endTime <= startTime) {
        setError('End time must be after start time');
        setLoading(false);
        return;
      }

      if (formData.reserve_price && parseFloat(formData.reserve_price) <= 0) {
        setError('Reserve price must be greater than 0');
        setLoading(false);
        return;
      }

      // Create auction session
      const { data, error } = await supabase
        .from('produce_auctions')
        .insert({
          produce_id: produceId,
          start_time: formData.start_time,
          end_time: formData.end_time,
          reserve_price: formData.reserve_price ? parseFloat(formData.reserve_price) : null,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setSuccess('Produce auction created successfully!');
      setAuction(data);
      setShowCreateForm(false);
      setFormData({ start_time: '', end_time: '', reserve_price: '' });

    } catch (error) {
      setError('Failed to create auction. Please try again.');
      console.error('Auction creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeAuction = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Call the finalize auction function
      const { data, error } = await supabase.functions.invoke('finalize-produce-auction', {
        body: {
          auction_id: auction.id
        }
      });

      if (error) throw error;

      if (data.success) {
        setSuccess('Auction finalized successfully!');
        fetchAuctionStatus(); // Refresh auction data
      } else {
        setError(data.error || 'Failed to finalize auction');
      }

    } catch (error) {
      setError('Failed to finalize auction. Please try again.');
      console.error('Auction finalization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Produce Auction Management</h3>
        <p className="text-gray-600">
          Manage auction for: <span className="font-semibold text-green-600">{produceName}</span>
        </p>
      </div>

      {/* Current Auction Status */}
      {auction && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-lg font-semibold text-blue-800 mb-3">Current Auction Status</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-700">
                <span className="font-medium">Status:</span> {auction.status}
              </p>
              <p className="text-sm text-blue-700">
                <span className="font-medium">Start Time:</span> {formatDateTime(auction.start_time)}
              </p>
              <p className="text-sm text-blue-700">
                <span className="font-medium">End Time:</span> {formatDateTime(auction.end_time)}
              </p>
            </div>
            <div>
              {auction.reserve_price && (
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Reserve Price:</span> {formatCurrency(auction.reserve_price)}
                </p>
              )}
              {auction.winner_bid_id && (
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Winner:</span> Bid #{auction.winner_bid_id}
                </p>
              )}
            </div>
          </div>
          
          {auction.status === 'active' && (
            <div className="mt-4">
              <button
                onClick={handleFinalizeAuction}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Finalizing...' : 'Finalize Auction'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Auction Form */}
      {!auction && (
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {showCreateForm ? 'Cancel' : 'Create New Auction'}
          </button>

          {showCreateForm && (
            <form onSubmit={handleCreateAuction} className="mt-4 p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-2">
                    Auction Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="start_time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-2">
                    Auction End Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="end_time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="reserve_price" className="block text-sm font-medium text-gray-700 mb-2">
                  Reserve Price (Optional)
                </label>
                <input
                  type="number"
                  id="reserve_price"
                  name="reserve_price"
                  value={formData.reserve_price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Minimum acceptable price"
                />
                <p className="text-sm text-gray-500 mt-1">
                  If no reserve price is set, the highest bid will automatically win
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Auction'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

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

      {/* Auction Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Auction Information</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• <strong>Start Time:</strong> When bidding begins</p>
          <p>• <strong>End Time:</strong> When bidding closes</p>
          <p>• <strong>Reserve Price:</strong> Minimum acceptable price (optional)</p>
          <p>• <strong>Winner Selection:</strong> Highest bid above reserve price wins</p>
          <p>• <strong>Payment:</strong> Only the winning bidder pays</p>
        </div>
      </div>
    </div>
  );
};

export default AuctionManagement;
