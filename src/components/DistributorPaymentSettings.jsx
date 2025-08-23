import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const DistributorPaymentSettings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [newMethod, setNewMethod] = useState({
    payment_method: 'card',
    card_last4: '',
    card_brand: '',
    upi_id: '',
    bank_name: '',
    default_payment_method: false
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPaymentMethods();
    }
  }, [user]);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('distributor_payment_configs')
        .select('*')
        .eq('distributor_id', user.id)
        .eq('is_active', true)
        .order('default_payment_method', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate inputs based on payment method
      if (newMethod.payment_method === 'card') {
        if (!newMethod.card_last4 || !newMethod.card_brand) {
          setError('Card last 4 digits and brand are required for card payments');
          setLoading(false);
          return;
        }
      } else if (newMethod.payment_method === 'upi') {
        if (!newMethod.upi_id) {
          setError('UPI ID is required for UPI payments');
          setLoading(false);
          return;
        }
      } else if (newMethod.payment_method === 'netbanking') {
        if (!newMethod.bank_name) {
          setError('Bank name is required for netbanking');
          setLoading(false);
          return;
        }
      }

      // If this is set as default, unset other defaults
      if (newMethod.default_payment_method) {
        await supabase
          .from('distributor_payment_configs')
          .update({ default_payment_method: false })
          .eq('distributor_id', user.id)
          .eq('is_active', true);
      }

      // Insert new payment method
      const { error } = await supabase
        .from('distributor_payment_configs')
        .insert({
          distributor_id: user.id,
          payment_method: newMethod.payment_method,
          card_last4: newMethod.card_last4 || null,
          card_brand: newMethod.card_brand || null,
          upi_id: newMethod.upi_id || null,
          bank_name: newMethod.bank_name || null,
          default_payment_method: newMethod.default_payment_method
        });

      if (error) throw error;

      setSuccess('Payment method added successfully!');
      setNewMethod({
        payment_method: 'card',
        card_last4: '',
        card_brand: '',
        upi_id: '',
        bank_name: '',
        default_payment_method: false
      });
      fetchPaymentMethods(); // Refresh the list
    } catch (error) {
      setError('Failed to add payment method. Please try again.');
      console.error('Payment method error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (methodId) => {
    try {
      // Unset all other defaults
      await supabase
        .from('distributor_payment_configs')
        .update({ default_payment_method: false })
        .eq('distributor_id', user.id)
        .eq('is_active', true);

      // Set this as default
      await supabase
        .from('distributor_payment_configs')
        .update({ default_payment_method: true })
        .eq('id', methodId);

      fetchPaymentMethods(); // Refresh the list
      setSuccess('Default payment method updated!');
    } catch (error) {
      setError('Failed to update default payment method');
      console.error('Default payment error:', error);
    }
  };

  const handleDelete = async (methodId) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;

    try {
      const { error } = await supabase
        .from('distributor_payment_configs')
        .update({ is_active: false })
        .eq('id', methodId);

      if (error) throw error;
      setSuccess('Payment method deleted successfully!');
      fetchPaymentMethods(); // Refresh the list
    } catch (error) {
      setError('Failed to delete payment method');
      console.error('Delete error:', error);
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'card':
        return '💳';
      case 'upi':
        return '📱';
      case 'netbanking':
        return '🏦';
      case 'wallet':
        return '👛';
      default:
        return '💰';
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'card':
        return 'Credit/Debit Card';
      case 'upi':
        return 'UPI';
      case 'netbanking':
        return 'Net Banking';
      case 'wallet':
        return 'Digital Wallet';
      default:
        return method;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Methods</h3>
        <p className="text-gray-600">
          Configure your preferred payment methods for when you win auctions.
        </p>
      </div>

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

      {/* Add New Payment Method Form */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Add New Payment Method</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method *
              </label>
              <select
                id="payment_method"
                value={newMethod.payment_method}
                onChange={(e) => setNewMethod({ ...newMethod, payment_method: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="card">Credit/Debit Card</option>
                <option value="upi">UPI</option>
                <option value="netbanking">Net Banking</option>
                <option value="wallet">Digital Wallet</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="default_payment_method"
                checked={newMethod.default_payment_method}
                onChange={(e) => setNewMethod({ ...newMethod, default_payment_method: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="default_payment_method" className="ml-2 text-sm text-gray-700">
                Set as default method
              </label>
            </div>
          </div>

          {/* Conditional fields based on payment method */}
          {newMethod.payment_method === 'card' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="card_last4" className="block text-sm font-medium text-gray-700 mb-2">
                  Last 4 Digits *
                </label>
                <input
                  type="text"
                  id="card_last4"
                  value={newMethod.card_last4}
                  onChange={(e) => setNewMethod({ ...newMethod, card_last4: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1234"
                  maxLength="4"
                  pattern="[0-9]{4}"
                />
              </div>
              <div>
                <label htmlFor="card_brand" className="block text-sm font-medium text-gray-700 mb-2">
                  Card Brand *
                </label>
                <select
                  id="card_brand"
                  value={newMethod.card_brand}
                  onChange={(e) => setNewMethod({ ...newMethod, card_brand: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select brand</option>
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                  <option value="amex">American Express</option>
                  <option value="rupay">RuPay</option>
                </select>
              </div>
            </div>
          )}

          {newMethod.payment_method === 'upi' && (
            <div>
              <label htmlFor="upi_id" className="block text-sm font-medium text-gray-700 mb-2">
                UPI ID *
              </label>
              <input
                type="text"
                id="upi_id"
                value={newMethod.upi_id}
                onChange={(e) => setNewMethod({ ...newMethod, upi_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="username@upi"
                required
              />
            </div>
          )}

          {newMethod.payment_method === 'netbanking' && (
            <div>
              <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name *
              </label>
              <input
                type="text"
                id="bank_name"
                value={newMethod.bank_name}
                onChange={(e) => setNewMethod({ ...newMethod, bank_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., HDFC Bank, SBI"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Adding...' : 'Add Payment Method'}
          </button>
        </form>
      </div>

      {/* Existing Payment Methods */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Your Payment Methods</h4>
        {paymentMethods.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No payment methods configured yet.</p>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getPaymentMethodIcon(method.payment_method)}</span>
                  <div>
                    <div className="font-medium text-gray-800">
                      {getPaymentMethodLabel(method.payment_method)}
                      {method.default_payment_method && (
                        <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {method.payment_method === 'card' && method.card_last4 && (
                        <>•••• {method.card_last4} ({method.card_brand})</>
                      )}
                      {method.payment_method === 'upi' && method.upi_id && (
                        <>{method.upi_id}</>
                      )}
                      {method.payment_method === 'netbanking' && method.bank_name && (
                        <>{method.bank_name}</>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {!method.default_payment_method && (
                    <button
                      onClick={() => handleSetDefault(method.id)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(method.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Information */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-lg font-semibold text-blue-800 mb-3">How It Works</h4>
        <ul className="text-sm text-blue-700 space-y-2 list-disc list-inside">
          <li>Configure your preferred payment methods for when you win auctions</li>
          <li>Set a default method that will be used automatically</li>
          <li>Your payment details are stored securely and only used for successful bids</li>
          <li>You can update or remove payment methods at any time</li>
        </ul>
      </div>
    </div>
  );
};

export default DistributorPaymentSettings;
