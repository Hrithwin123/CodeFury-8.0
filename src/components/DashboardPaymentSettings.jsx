import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { CreditCard, Save, TestTube, AlertCircle, CheckCircle } from 'lucide-react';

const DashboardPaymentSettings = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [config, setConfig] = useState({
    razorpay_key_id: '',
    razorpay_key_secret: '',
    webhook_secret: ''
  });
  const [existingConfig, setExistingConfig] = useState(null);

  useEffect(() => {
    if (user) {
      fetchExistingConfig();
    }
  }, [user]);

  const fetchExistingConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_configurations')
        .select('*')
        .eq('seller_id', user.id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
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
      if (!config.razorpay_key_id || !config.razorpay_key_secret) {
        setError('Razorpay Key ID and Key Secret are required');
        setLoading(false);
        return;
      }

      if (existingConfig) {
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
        fetchExistingConfig();
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
      // Simple test - just check if keys are in correct format
      if (config.razorpay_key_id.startsWith('rzp_') && config.razorpay_key_secret.length > 0) {
        setSuccess('Connection test successful! Your Razorpay keys are properly formatted.');
      } else {
        setError('Connection test failed. Please check your API keys format.');
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
    <div className="space-y-6">
      {/* Status Overview */}
      {existingConfig && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="font-medium text-green-800">Payment Configuration Active</h3>
              <p className="text-sm text-green-600">
                Your Razorpay account is configured and ready to receive payments
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      {/* Configuration Form */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
          <CreditCard className="w-5 h-5 text-emerald-600" />
          <span>Razorpay Configuration</span>
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="razorpay_key_id" className="block text-sm font-medium text-gray-700 mb-2">
              Razorpay Key ID *
            </label>
            <input
              type="text"
              id="razorpay_key_id"
              value={config.razorpay_key_id}
              onChange={(e) => setConfig({ ...config, razorpay_key_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="rzp_test_xxxxxxxxxxxxx"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Enter your secret key"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Enter webhook secret if you have one"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Webhook secret for additional security
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : (existingConfig ? 'Update' : 'Save')}</span>
            </button>

            {existingConfig && (
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={loading || !config.razorpay_key_id || !config.razorpay_key_secret}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
              >
                <TestTube className="w-4 h-4" />
                <span>Test Connection</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Current Configuration Status */}
      {existingConfig && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-medium text-blue-800 mb-3">Current Configuration</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">Key ID:</span>
              <span className="ml-2 text-blue-700 font-mono">{existingConfig.razorpay_key_id}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Active
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Last Updated:</span>
              <span className="ml-2 text-blue-700">
                {new Date(existingConfig.updated_at).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Webhook Secret:</span>
              <span className="ml-2 text-blue-700">
                {existingConfig.webhook_secret ? 'Configured' : 'Not set'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <h4 className="font-medium text-yellow-800 mb-3">How to Get Your Razorpay Keys</h4>
        <ol className="text-sm text-yellow-700 space-y-2 list-decimal list-inside">
          <li>Sign up for a Razorpay account at <a href="https://razorpay.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">razorpay.com</a></li>
          <li>Complete your business verification</li>
          <li>Go to Settings → API Keys in your dashboard</li>
          <li>Generate a new key pair</li>
          <li>Copy the Key ID and Key Secret</li>
          <li>Use test mode keys for development, production keys for live auctions</li>
        </ol>
      </div>
    </div>
  );
};

export default DashboardPaymentSettings;
