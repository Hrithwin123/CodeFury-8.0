import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { supabase } from '../../supabaseClient.js';
import { 
  Heart, 
  X, 
  DollarSign, 
  MapPin, 
  Calendar, 
  Scale, 
  Star, 
  Gavel,
  TrendingUp,
  Package,
  Users,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

const DistributorDashboard = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [produceData, setProduceData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filterCategory, setFilterCategory] = useState('all');
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidQuantity, setBidQuantity] = useState('');
  const [bidding, setBidding] = useState(false);
  const [myBids, setMyBids] = useState([]);
  const [activeTab, setActiveTab] = useState('swipe'); // 'swipe' or 'bids'
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // Check user authentication and role on component mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          const role = user.user_metadata?.user_role || 'consumer';
          setUserRole(role);
          
          if (role === 'distributor') {
            await fetchProduceData();
            await fetchMyBids();
          }
        }
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // Fetch produce data from database
  const fetchProduceData = async () => {
    try {
      const { data, error } = await supabase
        .from('farmer_listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match the expected format
      const transformedData = data.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        farm: item.farm_name || 'Local Farm',
        location: item.location,
        rating: item.rating || 0,
        reviews: item.reviews_count || 0,
        image: item.image_url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=500&fit=crop&crop=center',
        description: item.description,
        category: item.category,
        harvestDate: item.harvest_date || 'Recently',
        quantity: item.quantity,
        certifications: item.certifications || [],
        freshness: item.freshness || 100,
        tags: item.tags || [],
        startingBid: item.starting_bid || parseFloat(item.price.replace(/[^\d.]/g, '')) * 0.8, // 80% of asking price as starting bid
        currentBids: item.current_bids || 0
      }));
      
      setProduceData(transformedData);
    } catch (error) {
      console.error('Error fetching produce data:', error);
      // Fallback to sample data if database fails
      setProduceData([
        {
          id: 1,
          name: "Organic Heirloom Tomatoes",
          price: "₹45/kg",
          farm: "Ramesh Organic Farm",
          location: "Pune, Maharashtra",
          rating: 4.8,
          reviews: 127,
          image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=500&fit=crop&crop=center",
          description: "Premium heirloom tomatoes with rich flavor, grown using sustainable farming practices.",
          category: "Vegetables",
          harvestDate: "Today",
          quantity: "50kg available",
          certifications: ["Organic", "Pesticide-free"],
          freshness: 100,
          tags: ["premium", "heirloom", "sustainable"],
          startingBid: 36,
          currentBids: 3
        }
      ]);
    }
  };

  // Fetch distributor's bids
  const fetchMyBids = async () => {
    try {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('distributor_bids')
        .select(`
          *,
          produce:farmer_listings(*)
        `)
        .eq('distributor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyBids(data || []);
    } catch (error) {
      console.error('Error fetching bids:', error);
    }
  };

  // Handle swipe gestures
  const handleDragEnd = useCallback(async (event, info) => {
    const swipeThreshold = 100;
    
    if (info.offset.x > swipeThreshold) {
      // Swipe right - show bid modal
      setSelectedProduct(produceData[currentIndex]);
      setShowBidModal(true);
      setBidAmount('');
      setBidQuantity('');
    } else if (info.offset.x < -swipeThreshold) {
      // Swipe left - pass
      handleNext();
    }
    
    // Reset position
    x.set(0);
    y.set(0);
  }, [currentIndex, produceData, x, y]);

  const handleNext = () => {
    if (currentIndex < produceData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop back to start
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(produceData.length - 1); // Loop to end
    }
  };

  // Handle bid submission
  const handleBidSubmit = async () => {
    if (!user?.id || !selectedProduct || !bidAmount || !bidQuantity) return;
    
    setBidding(true);
    try {
      // Create bid record
      const { data, error } = await supabase
        .from('distributor_bids')
        .insert({
          distributor_id: user.id,
          produce_id: selectedProduct.id,
          bid_amount: parseFloat(bidAmount),
          bid_quantity: parseFloat(bidQuantity),
          status: 'pending'
        });

      if (error) throw error;

      // Update produce listing with new bid count
      await supabase
        .from('farmer_listings')
        .update({ 
          current_bids: (selectedProduct.currentBids || 0) + 1 
        })
        .eq('id', selectedProduct.id);

      setMessage('Bid placed successfully!');
      setMessageType('success');
      setShowBidModal(false);
      setSelectedProduct(null);
      
      // Refresh data
      await fetchProduceData();
      await fetchMyBids();
      
    } catch (error) {
      console.error('Error placing bid:', error);
      setMessage('Failed to place bid. Please try again.');
      setMessageType('error');
    } finally {
      setBidding(false);
    }
  };

  // Filter data based on category
  const filteredData = useMemo(() => {
    if (filterCategory === 'all') return produceData;
    return produceData.filter(item => 
      item.category?.toLowerCase().includes(filterCategory.toLowerCase())
    );
  }, [filterCategory, produceData]);

  const currentProduct = filteredData[currentIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-gray-600">Loading distributor dashboard...</p>
        </div>
      </div>
    );
  }

  if (userRole !== 'distributor') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Access denied. This dashboard is for distributors only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Distributor Dashboard</h1>
                <p className="text-sm text-gray-500">Bid on fresh produce from local farmers</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Welcome back,</p>
                <p className="font-medium text-gray-900">{user?.email?.split('@')[0]}</p>
              </div>
              <button
                onClick={() => supabase.auth.signOut()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm">
          <button
            onClick={() => setActiveTab('swipe')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'swipe'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Heart className="w-4 h-4" />
              <span>Swipe & Bid</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('bids')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'bids'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Gavel className="w-4 h-4" />
              <span>My Bids</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'swipe' ? (
          <div className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {['all', 'Vegetables', 'Grains', 'Leafy Greens', 'Root Vegetables', 'Herbs'].map((category) => (
                <button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterCategory === category
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : category}
                </button>
              ))}
            </div>

            {/* Swipe Interface */}
            {filteredData.length > 0 ? (
              <div className="flex justify-center">
                <div className="relative w-80 h-96">
                  <motion.div
                    key={currentProduct?.id}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.9}
                    onDragEnd={handleDragEnd}
                    style={{ x, y, rotate, opacity }}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing"
                  >
                    <div className="w-full h-full bg-white rounded-2xl shadow-xl overflow-hidden">
                      <div className="relative h-64 bg-gray-200">
                        <img
                          src={currentProduct?.image}
                          alt={currentProduct?.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                          <div className="flex items-center space-x-1 text-emerald-600">
                            <Gavel className="w-4 h-4" />
                            <span className="text-sm font-medium">{currentProduct?.currentBids || 0} bids</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6 space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{currentProduct?.name}</h3>
                          <p className="text-gray-600 text-sm">{currentProduct?.description}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                            <span className="text-gray-700">₹{currentProduct?.price}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                            <span className="text-gray-700">Starting: ₹{currentProduct?.startingBid}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-emerald-600" />
                            <span className="text-gray-700">{currentProduct?.location}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Scale className="w-4 h-4 text-emerald-600" />
                            <span className="text-gray-700">{currentProduct?.quantity}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm text-gray-600">{currentProduct?.rating}</span>
                            <span className="text-sm text-gray-400">({currentProduct?.reviews} reviews)</span>
                          </div>
                          <span className="text-xs text-gray-500">{currentProduct?.farm}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Navigation Arrows */}
                  <button
                    onClick={handlePrevious}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                  >
                    <ArrowRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No produce available</h3>
                <p className="text-gray-500">Check back later for fresh produce from local farmers.</p>
              </div>
            )}
            
                         {/* Swipe Instructions */}
             <div className="text-center text-sm text-gray-500">
               <p>Swipe right to bid, left to pass • Use arrows to navigate</p>
             </div>
             
             {/* Message Display */}
             {message && (
               <div className={`p-4 rounded-xl text-sm font-medium border ${
                 messageType === 'error' 
                   ? 'bg-red-50 text-red-700 border-red-200' 
                   : 'bg-emerald-50 text-emerald-700 border-emerald-200'
               } transition-all duration-200`}>
                 {message}
               </div>
             )}
          </div>
        ) : (
          /* My Bids Tab */
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">My Bids</h2>
              
              {myBids.length > 0 ? (
                <div className="space-y-4">
                  {myBids.map((bid) => (
                    <div key={bid.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                                                     <img
                             src={bid.produce?.image_url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100&h=100&fit=crop&crop=center'}
                             alt={bid.produce?.name}
                             className="w-16 h-16 rounded-lg object-cover"
                           />
                           <div>
                             <h4 className="font-medium text-gray-900">{bid.produce?.name}</h4>
                             <p className="text-sm text-gray-500">Farmer's Produce</p>
                            <div className="flex items-center space-x-4 mt-1 text-sm">
                              <span className="text-emerald-600 font-medium">₹{bid.bid_amount}/kg</span>
                              <span className="text-gray-500">{bid.bid_quantity}kg</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {bid.status === 'pending' ? 'Pending' :
                             bid.status === 'accepted' ? 'Accepted' : 'Rejected'}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(bid.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Gavel className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bids yet</h3>
                  <p className="text-gray-500">Start swiping and bidding on produce to see your bids here.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bid Modal */}
      {showBidModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gavel className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Place Your Bid</h3>
              <p className="text-gray-600">Make an offer for {selectedProduct.name}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bid Amount (₹/kg)
                </label>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Min: ₹${selectedProduct.startingBid}`}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  min={selectedProduct.startingBid}
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Starting bid: ₹{selectedProduct.startingBid}/kg
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity (kg)
                </label>
                <input
                  type="number"
                  value={bidQuantity}
                  onChange={(e) => setBidQuantity(e.target.value)}
                  placeholder="Enter quantity"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  min="1"
                  max={parseInt(selectedProduct.quantity)}
                  step="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available: {selectedProduct.quantity}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBidModal(false)}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBidSubmit}
                disabled={bidding || !bidAmount || !bidQuantity}
                className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                {bidding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Placing Bid...
                  </>
                ) : (
                  'Place Bid'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistributorDashboard;
