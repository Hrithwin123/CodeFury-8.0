import React, { useState } from 'react';
import BiddingSystem from '../components/BiddingSystem';
import AuctionManagement from '../components/AuctionManagement';
import PaymentConfiguration from '../components/PaymentConfiguration';
import DistributorPaymentSettings from '../components/DistributorPaymentSettings';

const BiddingDemo = () => {
  const [selectedProduce, setSelectedProduce] = useState({
    id: 'demo-produce-1',
    name: 'Fresh Tomatoes',
    currentPrice: 150
  });

  const [userRole, setUserRole] = useState('distributor'); // 'distributor', 'farmer', or 'equipment_seller'

  const demoProduce = [
    { id: 'demo-produce-1', name: 'Fresh Tomatoes', currentPrice: 150 },
    { id: 'demo-produce-2', name: 'Organic Wheat', currentPrice: 250 },
    { id: 'demo-produce-3', name: 'Premium Rice', currentPrice: 75 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Agriculture Produce Bidding System
          </h1>
          <p className="text-xl text-gray-600">
            Demo of the complete produce bidding and auction management system
          </p>
        </div>

        {/* Role Selector */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Select Your Role</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setUserRole('distributor')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                userRole === 'distributor'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Distributor (Bid on Produce)
            </button>
            <button
              onClick={() => setUserRole('farmer')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                userRole === 'farmer'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Farmer (Sell Produce)
            </button>
            <button
              onClick={() => setUserRole('equipment_seller')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                userRole === 'equipment_seller'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Equipment Seller (Basic)
            </button>
          </div>
        </div>

        {/* Produce Selector */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Select Produce</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {demoProduce.map((produce) => (
              <div
                key={produce.id}
                onClick={() => setSelectedProduce(produce)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedProduce.id === produce.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-gray-800">{produce.name}</h3>
                <p className="text-green-600 font-medium">
                  ₹{produce.currentPrice.toLocaleString()}/kg
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Bidding System */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {userRole === 'distributor' ? 'Place Your Bid' : 'View Bidding Activity'}
            </h2>
            <BiddingSystem
              produceId={selectedProduce.id}
              currentPrice={selectedProduce.currentPrice}
            />
          </div>

          {/* Right Column - Auction Management or Payment Settings */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {userRole === 'farmer' ? 'Manage Produce Auction' : userRole === 'distributor' ? 'Payment Settings' : 'Equipment Management'}
            </h2>
            {userRole === 'farmer' ? (
              <AuctionManagement
                produceId={selectedProduce.id}
                produceName={selectedProduce.name}
              />
            ) : userRole === 'distributor' ? (
              <DistributorPaymentSettings />
            ) : (
              <div className="bg-gray-100 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Equipment Seller Dashboard</h3>
                <p className="text-gray-600">This section is under development. Equipment sellers will be able to manage their equipment listings here.</p>
              </div>
            )}
          </div>
        </div>

        {/* System Features */}
        <div className="mt-12 bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            System Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Secure Payments</h3>
              <p className="text-gray-600">Razorpay integration with test mode support</p>
            </div>

            <div className="text-center p-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Real-time Updates</h3>
              <p className="text-gray-600">Live bidding with instant notifications</p>
            </div>

            <div className="text-center p-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Smart Auctions</h3>
              <p className="text-gray-600">Reserve prices and automatic winner selection</p>
            </div>

            <div className="text-center p-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Secure Bidding</h3>
              <p className="text-gray-600">Card details collected only from winners</p>
            </div>

            <div className="text-center p-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Time Management</h3>
              <p className="text-gray-600">Flexible auction scheduling and countdown</p>
            </div>

            <div className="text-center p-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Analytics</h3>
              <p className="text-gray-600">Comprehensive bidding and payment tracking</p>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="mt-12 bg-blue-50 p-8 rounded-lg">
          <h2 className="text-3xl font-bold text-blue-800 mb-6 text-center">
            Getting Started
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-blue-800 mb-4">For Farmers</h3>
                <ol className="list-decimal list-inside space-y-2 text-blue-700">
                  <li>Select your role as "Farmer"</li>
                  <li>Choose the produce you want to auction</li>
                  <li>Set auction start and end times</li>
                  <li>Optionally set a reserve price</li>
                  <li>Monitor bidding activity</li>
                  <li>Finalize auction when ready</li>
                </ol>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-800 mb-4">For Distributors</h3>
                <ol className="list-decimal list-inside space-y-2 text-blue-700">
                  <li>Select your role as "Distributor"</li>
                  <li>Fill in your company information</li>
                  <li>Browse available produce</li>
                  <li>Place bids with payment details</li>
                  <li>Monitor your bid status</li>
                  <li>Only pay if you win the auction</li>
                  <li>Receive produce after payment</li>
                </ol>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-800 mb-4">For Equipment Sellers</h3>
                <ol className="list-decimal list-inside space-y-2 text-blue-700">
                  <li>Select your role as "Equipment Seller"</li>
                  <li>This section is under development</li>
                  <li>Will manage farming equipment sales</li>
                  <li>Separate from produce auctions</li>
                  <li>Coming soon...</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="mt-12 bg-yellow-50 p-8 rounded-lg border border-yellow-200">
          <h2 className="text-2xl font-bold text-yellow-800 mb-4 text-center">
            ⚠️ Important Security Notes
          </h2>
          <div className="max-w-4xl mx-auto text-yellow-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">🔒 Payment Security</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Card details are collected during bidding but NOT charged immediately</li>
                  <li>• Payment is only processed from the winning bidder after auction ends</li>
                  <li>• All card information is securely tokenized by Razorpay</li>
                  <li>• No actual charges until auction finalization</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">📋 Simple Process</h3>
                <ul className="space-y-2 text-sm">
                  <li>• No profile setup required - enter info directly</li>
                  <li>• Farmers must configure Razorpay keys to receive payments</li>
                  <li>• All transactions are logged and tracked</li>
                  <li>• Test mode available for development</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiddingDemo;
