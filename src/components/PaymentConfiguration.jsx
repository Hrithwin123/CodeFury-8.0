import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const PaymentConfiguration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [config, setConfig] = useState({
    razorpay_key_id: '',
    razorpay_key_secret: '',
    webhook_secret: ''
  });
  const [existingConfig, setExistingConfig] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchExistingConfig();
    }
  }, [user]);

  const fetchExistingConfig = async () => {
    try {
      // Get the seller's payment configuration
      const { data, error } = await supabase
        .from('payment_configurations')
        .select('*')
        .eq('seller_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setExistingConfig(data);
        setConfig({
          razorpay_key_id: data.razorpay_key_id,
          razorpay_key_secret: data.razorpay_key_secret,
          webhook_secret: data.webhook_secret || ''
        });
      }
    } catch (error) {
      console.error('Error fetching payment config:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate inputs
      if (!config.razorpay_key_id || !config.razorpay_key_secret) {
        setError('Razorpay Key ID and Key Secret are required');
        setLoading(false);
        return;
      }

      if (existingConfig) {
        // Update existing configuration
        const { error } = await supabase
          .from('payment_configurations')
          .update({
            razorpay_key_id: config.razorpay_key_id,
            razorpay_key_secret: config.razorpay_key_secret,
            webhook_secret: config.webhook_secret || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConfig.id);

        if (error) throw error;
        setSuccess('Payment configuration updated successfully!');
      } else {
        // Create new configuration
        const { error } = await supabase
          .from('payment_configurations')
          .insert({
            seller_id: user.id,
            razorpay_key_id: config.razorpay_key_id,
            razorpay_key_secret: config.razorpay_key_secret,
            webhook_secret: config.webhook_secret || null
          });

        if (error) throw error;
        setSuccess('Payment configuration created successfully!');
        fetchExistingConfig(); // Refresh to show the new config
      }

    } catch (error) {
      setError('Failed to save payment configuration. Please try again.');
      console.error('Payment config error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Test the Razorpay connection by making a test API call
      const response = await fetch('/api/test-razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`
        },
        body: JSON.stringify({
          key_id: config.razorpay_key_id,
          key_secret: config.razorpay_key_secret
        })
      });

      if (response.ok) {
        setSuccess('Connection test successful! Your Razorpay keys are working.');
      } else {
        setError('Connection test failed. Please check your API keys.');
      }
    } catch (error) {
      setError('Connection test failed. Please check your API keys and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (existingConfig) {
      setConfig({
        razorpay_key_id: existingConfig.razorpay_key_id,
        razorpay_key_secret: existingConfig.razorpay_key_secret,
        webhook_secret: existingConfig.webhook_secret || ''
      });
    } else {
      setConfig({
        razorpay_key_id: '',
        razorpay_key_secret: '',
        webhook_secret: ''
      });
    }
    setError('');
    setSuccess('');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Configuration</h3>
        <p className="text-gray-600">
          Configure your Razorpay account to receive payments from equipment auctions.
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

      {/* Configuration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="razorpay_key_id" className="block text-sm font-medium text-gray-700 mb-2">
            Razorpay Key ID *
          </label>
          <input
            type="text"
            id="razorpay_key_id"
            value={config.razorpay_key_id}
            onChange={(e) => setConfig({ ...config, razorpay_key_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="rzp_test_xxxxxxxxxxxxx"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Your Razorpay Key ID (starts with rzp_test_ for test mode)
          </p>
        </div>

        <div>
          <label htmlFor="razorpay_key_secret" className="block text-sm font-medium text-gray-700 mb-2">
            Razorpay Key Secret *
          </label>
          <input
            type="password"
            id="razorpay_key_secret"
            value={config.razorpay_key_secret}
            onChange={(e) => setConfig({ ...config, razorpay_key_secret: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your secret key"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Your Razorpay Key Secret (keep this secure)
          </p>
        </div>

        <div>
          <label htmlFor="webhook_secret" className="block text-sm font-medium text-gray-700 mb-2">
            Webhook Secret (Optional)
          </label>
          <input
            type="password"
            id="webhook_secret"
            value={config.webhook_secret}
            onChange={(e) => setConfig({ ...config, webhook_secret: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter webhook secret if you have one"
          />
          <p className="text-sm text-gray-500 mt-1">
            Optional: Webhook secret for additional security
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Saving...' : (existingConfig ? 'Update Configuration' : 'Save Configuration')}
          </button>

          {existingConfig && (
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={loading || !config.razorpay_key_id || !config.razorpay_key_secret}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Test Connection
            </button>
          )}

          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-lg font-semibold text-blue-800 mb-3">How to Get Your Razorpay Keys</h4>
        <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
          <li>Sign up for a Razorpay account at <a href="https://razorpay.com" target="_blank" rel="noopener noreferrer" className="underline">razorpay.com</a></li>
          <li>Complete your business verification</li>
          <li>Go to Settings → API Keys in your dashboard</li>
          <li>Generate a new key pair</li>
          <li>Copy the Key ID and Key Secret</li>
          <li>Use test mode keys for development, production keys for live auctions</li>
        </ol>
      </div>

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h4 className="text-lg font-semibold text-yellow-800 mb-2">Security Notice</h4>
        <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
          <li>Your API keys are encrypted and stored securely</li>
          <li>Never share your Key Secret with anyone</li>
          <li>Use test mode keys during development</li>
          <li>Rotate your keys regularly for security</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentConfiguration;
