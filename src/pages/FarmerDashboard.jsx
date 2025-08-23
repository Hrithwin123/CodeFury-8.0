import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Plus, 
  Image as ImageIcon, 
  X, 
  Save, 
  Trash2, 
  Edit3, 
  Eye,
  ArrowLeft,
  Leaf,
  DollarSign,
  MapPin,
  Calendar,
  Package,
  Tag,
  Star,
  AlertCircle,
  Gavel,
  Wrench,
  Shield,
  CheckCircle
} from 'lucide-react';
import { supabase, getStorageBucket } from '../../supabaseClient.js';

const FarmerDashboard = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [myListings, setMyListings] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('listings'); // 'listings', 'bids', or 'equipment'
  const [receivedBids, setReceivedBids] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Vegetables',
    quantity: '',
    harvestDate: '',
    location: '',
    certifications: [],
    tags: [],
    auctionEndTime: '' // New field for auction end time
  });

  // Image handling
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);

  const categories = [
    'Vegetables', 'Fruits', 'Grains', 'Dairy', 'Meat', 'Herbs', 'Nuts', 'Other'
  ];

  const certificationOptions = [
    'Organic', 'Pesticide-free', 'Non-GMO', 'Fair Trade', 'Local', 'Fresh'
  ];

  // Check user authentication and role on component mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          const role = user.user_metadata?.user_role || 'consumer';
          setUserRole(role);
          // Don't call fetchMyListings here, wait for user state to be set
        }
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // Fetch listings when user is available
  useEffect(() => {
    if (user && user.id) {
      fetchMyListings();
      fetchReceivedBids();
    }
  }, [user]);

  // Fetch bids received on farmer's produce
  const fetchReceivedBids = async () => {
    try {
      if (!user?.id) return;
      
      // First, get all bids
      const { data: bidsData, error: bidsError } = await supabase
        .from('distributor_bids')
        .select('*')
        .order('created_at', { ascending: false });

      if (bidsError) throw bidsError;

      // Then, get the produce details for these bids
      if (bidsData && bidsData.length > 0) {
        const produceIds = [...new Set(bidsData.map(bid => bid.produce_id))];
        
        const { data: produceData, error: produceError } = await supabase
          .from('farmer_listings')
          .select('*')
          .in('id', produceIds)
          .eq('user_id', user.id);

        if (produceError) throw produceError;

        // Filter bids to only show those on this farmer's produce
        const farmerBids = bidsData.filter(bid => 
          produceData.some(produce => produce.id === bid.produce_id)
        );

        // Get distributor emails for these bids
        const distributorIds = [...new Set(farmerBids.map(bid => bid.distributor_id))];
        
        // Get user emails from auth.users
        const { data: userData, error: userError } = await supabase
          .from('auth.users')
          .select('id, email')
          .in('id', distributorIds);

        if (userError) {
          console.warn('Could not fetch distributor emails:', userError);
        }

        // Create a map of user ID to email
        const userEmailMap = {};
        if (userData) {
          userData.forEach(user => {
            userEmailMap[user.id] = user.email;
          });
        }

        // Enrich bids with produce details and distributor emails
        const enrichedBids = farmerBids.map(bid => {
          const produce = produceData.find(p => p.id === bid.produce_id);
          const distributorEmail = userEmailMap[bid.distributor_id] || 'Unknown';
          
          return {
            ...bid,
            produce: produce || {},
            distributor: { email: distributorEmail }
          };
        });

        setReceivedBids(enrichedBids);
      } else {
        setReceivedBids([]);
      }
    } catch (error) {
      console.error('Error fetching received bids:', error);
    }
  };

  const fetchMyListings = async () => {
    try {
      // Check if user is available
      if (!user || !user.id) {
        console.log('User not available yet, skipping fetch');
        return;
      }

      const { data, error } = await supabase
        .from('farmer_listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setError('Failed to fetch your listings');
    }
  };

  const uploadImage = async (file) => {
    try {
      setUploading(true);
      setImageUploadProgress(0);

      // Check if user is available
      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }

      // Generate unique filename with flat structure
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await getStorageBucket().upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

      if (error) {
        console.error('Storage upload error:', error);
        // Check if it's an RLS error
        if (error.message.includes('row-level security policy')) {
          throw new Error('Storage access denied. Please check your storage bucket policies.');
        }
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = getStorageBucket().getPublicUrl(fileName);
      
      setImageUploadProgress(100);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      setImageUploadProgress(0);
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setSelectedImage(file);
      setError('');
      
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCertificationToggle = (cert) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert]
    }));
  };

  const handleTagsChange = (value) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      category: 'Vegetables',
      quantity: '',
      harvestDate: '',
      location: '',
      certifications: [],
      tags: [],
      auctionEndTime: '' // Reset auction end time
    });
    setSelectedImage(null);
    setImagePreview(null);
    setEditingItem(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Check if user is available
      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }

      let imageUrl = imagePreview;

      // Upload new image if selected
      if (selectedImage) {
        try {
          imageUrl = await uploadImage(selectedImage);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          // Continue without image if upload fails
          imageUrl = null;
          setError('Image upload failed, but you can still save the listing without an image.');
        }
      }

      const listingData = {
        name: formData.name,
        price: formData.price,
        description: formData.description,
        category: formData.category,
        quantity: formData.quantity,
        harvest_date: formData.harvestDate,
        location: formData.location,
        certifications: formData.certifications,
        tags: formData.tags,
        image_url: imageUrl,
        user_id: user.id,
        auction_end_time: formData.auctionEndTime || null
      };

      if (editingItem) {
        // Update existing listing
        const { data, error } = await supabase
          .from('farmer_listings')
          .update(listingData)
          .eq('id', editingItem.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;

        setMyListings(prev => prev.map(item => 
          item.id === editingItem.id ? data : item
        ));
      } else {
        // Create new listing
        const { data, error } = await supabase
          .from('farmer_listings')
          .insert(listingData)
          .select()
          .single();

        if (error) throw error;

        setMyListings(prev => [data, ...prev]);
      }

      resetForm();
      setShowAddForm(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving listing:', error);
      setError(error.message || 'Failed to save listing');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      description: item.description,
      category: item.category,
      quantity: item.quantity,
      harvestDate: item.harvest_date || '',
      location: item.location || '',
      certifications: item.certifications || [],
      tags: item.tags || [],
      auctionEndTime: item.auction_end_time || '' // Set auction end time for editing
    });
    setImagePreview(item.image_url);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        // Check if user is available
        if (!user || !user.id) {
          throw new Error('User not authenticated');
        }

        const { error } = await supabase
          .from('farmer_listings')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;

        setMyListings(prev => prev.filter(item => item.id !== id));
      } catch (error) {
        console.error('Error deleting listing:', error);
        setError('Failed to delete listing');
      }
    }
  };

  // Handle bid acceptance/rejection
  const handleBidAction = async (bidId, action) => {
    try {
      // Get the bid details first
      const { data: bidData, error: bidError } = await supabase
        .from('distributor_bids')
        .select('*')
        .eq('id', bidId)
        .single();

      if (bidError) throw bidError;

      // Update bid status
      const { error: updateError } = await supabase
        .from('distributor_bids')
        .update({ status: action })
        .eq('id', bidId);
      
      if (updateError) throw updateError;

      // If bid is accepted, update the produce quantity
      if (action === 'accepted' && bidData) {
        const { data: produceData, error: produceError } = await supabase
          .from('farmer_listings')
          .select('quantity')
          .eq('id', bidData.produce_id)
          .single();

        if (produceError) throw produceError;

        // Parse current quantity and subtract bid quantity
        const currentQuantity = parseFloat(produceData.quantity.replace(/[^\d.]/g, ''));
        const bidQuantity = parseFloat(bidData.bid_quantity);
        const newQuantity = Math.max(0, currentQuantity - bidQuantity);

        // Update the produce listing with new quantity
        const { error: quantityError } = await supabase
          .from('farmer_listings')
          .update({ 
            quantity: `${newQuantity}kg available`,
            current_bids: (produceData.current_bids || 0) + 1
          })
          .eq('id', bidData.produce_id);

        if (quantityError) {
          console.warn('Could not update produce quantity:', quantityError);
        }

        // If quantity becomes 0, mark as sold out
        if (newQuantity === 0) {
          await supabase
            .from('farmer_listings')
            .update({ status: 'sold_out' })
            .eq('id', bidData.produce_id);
        }
      }
      
      // Refresh bids and listings
      await fetchReceivedBids();
      await fetchMyListings();
      
      // Show success message for accepted bids
      if (action === 'accepted') {
        setError(''); // Clear any previous errors
        // You could add a success state here if you want to show success messages
      } else {
        setError('');
      }
    } catch (error) {
      console.error('Error updating bid status:', error);
      setError(`Failed to ${action} bid`);
    }
  };

  // Function to get the highest bid for a specific produce listing
  const getHighestBidForListing = (listingId) => {
    const bidsForListing = receivedBids.filter(bid => 
      bid.produce_id === listingId && bid.status === 'pending'
    );
    
    if (bidsForListing.length === 0) return null;
    
    // Find the highest bid based on price × quantity score
    return bidsForListing.reduce((highest, current) => {
      const highestScore = parseFloat(highest.bid_amount) * parseFloat(highest.bid_quantity);
      const currentScore = parseFloat(current.bid_amount) * parseFloat(current.bid_quantity);
      return currentScore > highestScore ? current : highest;
    });
  };

  // Function to automatically replace lower bids with better ones
  const replaceLowerBids = async (newBid) => {
    try {
      // Get all pending bids for the same produce
      const { data: existingBids, error } = await supabase
        .from('distributor_bids')
        .select('*')
        .eq('produce_id', newBid.produce_id)
        .eq('status', 'pending');

      if (error) throw error;

      // Calculate bid score (price * quantity for better comparison)
      const newBidScore = parseFloat(newBid.bid_amount) * parseFloat(newBid.bid_quantity);
      
      // Find bids that should be replaced (lower score)
      const bidsToReplace = existingBids.filter(bid => {
        const bidScore = parseFloat(bid.bid_amount) * parseFloat(bid.bid_quantity);
        return bidScore < newBidScore && bid.id !== newBid.id;
      });

      // Update lower bids to replaced status and notify distributors
      if (bidsToReplace.length > 0) {
        const bidIds = bidsToReplace.map(bid => bid.id);
        const { error: updateError } = await supabase
          .from('distributor_bids')
          .update({ 
            status: 'replaced',
            replaced_at: new Date().toISOString(),
            replaced_by_bid: newBid.id
          })
          .in('id', bidIds);

        if (updateError) {
          console.warn('Could not update lower bids:', updateError);
        } else {
          // Notify outbid distributors (you could implement email/push notifications here)
          console.log(`${bidsToReplace.length} distributors have been outbid`);
        }
      }

      return bidsToReplace.length;
    } catch (error) {
      console.error('Error replacing lower bids:', error);
      return 0;
    }
  };

  // Function to check and auto-accept winning bids when auctions end
  const checkAndAutoAcceptAuctions = async () => {
    try {
      const now = new Date().toISOString();
      
      // Find produce listings where auction has ended and there are pending bids
      const { data: endedAuctions, error } = await supabase
        .from('farmer_listings')
        .select(`
          *,
          distributor_bids!inner(*)
        `)
        .not('auction_end_time', 'is', null)
        .lt('auction_end_time', now)
        .eq('status', 'active');

      if (error) throw error;

      for (const auction of endedAuctions || []) {
        if (auction.distributor_bids && auction.distributor_bids.length > 0) {
          // Find the highest bid
          const highestBid = auction.distributor_bids.reduce((highest, current) => {
            const highestScore = parseFloat(highest.bid_amount) * parseFloat(highest.bid_quantity);
            const currentScore = parseFloat(current.bid_amount) * parseFloat(current.bid_quantity);
            return currentScore > highestScore ? current : highest;
          });

          // Auto-accept the highest bid
          await handleBidAction(highestBid.id, 'accepted');
          
          // Mark the listing as auction ended
          await supabase
            .from('farmer_listings')
            .update({ 
              status: 'auction_ended',
              winning_bid_id: highestBid.id
            })
            .eq('id', auction.id);

          console.log(`Auction auto-closed for ${auction.name}, winning bid: ₹${highestBid.bid_amount}/kg x ${highestBid.bid_quantity}kg`);
        }
      }
    } catch (error) {
      console.error('Error checking auctions:', error);
    }
  };

  // Check auctions every minute when component is active
  useEffect(() => {
    const interval = setInterval(checkAndAutoAcceptAuctions, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const toggleStatus = async (id) => {
    try {
      // Check if user is available
      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }

      const currentItem = myListings.find(item => item.id === id);
      const newStatus = currentItem.status === 'active' ? 'inactive' : 'active';

      const { error } = await supabase
        .from('farmer_listings')
        .update({ status: newStatus })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setMyListings(prev => prev.map(item => 
        item.id === id ? { ...item, status: newStatus } : item
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update listing status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-lg border-b border-emerald-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a href="/swipe" className="p-2 hover:bg-emerald-100 rounded-xl transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </a>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Farmer Dashboard</h1>
                  <p className="text-sm text-gray-500">Manage your produce listings</p>
                </div>
              </div>
            </div>
            
                         <div className="flex items-center space-x-3">
               <button
                 onClick={() => setShowAddForm(true)}
                 className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-2 rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center space-x-2"
               >
                 <Plus className="w-4 h-4" />
                 <span>Add Listing</span>
               </button>
               <button
                 onClick={async () => {
                   await supabase.auth.signOut();
                   window.location.href = '/auth';
                 }}
                 className="bg-red-100 hover:bg-red-200 text-red-600 p-3 rounded-xl transition-colors"
                 title="Logout"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                 </svg>
               </button>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm mb-8">
          <button
            onClick={() => setActiveTab('listings')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'listings'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Package className="w-4 h-4" />
              <span>My Listings</span>
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
              <span>Received Bids</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('equipment')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'equipment'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Wrench className="w-4 h-4" />
              <span>Equipment Marketplace</span>
            </div>
          </button>
        </div>

        {activeTab === 'listings' && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{myListings.length}</p>
                    <p className="text-sm text-gray-500">Total Listings</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{myListings.filter(item => item.status === 'active').length}</p>
                    <p className="text-sm text-gray-500">Active Listings</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {myListings.length > 0 
                        ? (myListings.reduce((sum, item) => sum + (item.rating || 0), 0) / myListings.length).toFixed(1)
                        : '0'
                      }
                    </p>
                    <p className="text-sm text-gray-500">Avg Rating</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      ₹{myListings.length > 0 
                        ? myListings.reduce((sum, item) => {
                            const highestBid = getHighestBidForListing(item.id);
                            if (highestBid) {
                              // Use the highest bid amount × quantity
                              return sum + (parseFloat(highestBid.bid_amount) * parseFloat(highestBid.bid_quantity));
                            } else {
                              // Fall back to farmer's price × available quantity
                              const price = parseFloat(item.price.replace(/[^\d.]/g, '') || 0);
                              const quantity = parseFloat(item.quantity.replace(/[^\d.]/g, '') || 0);
                              return sum + (price * quantity);
                            }
                          }, 0).toFixed(2)
                        : '0.00'
                      }
                    </p>
                    <p className="text-sm text-gray-500">Total Value (Highest Bids)</p>
                    <p className="text-xs text-gray-400 mt-1">Shows best offers from distributors</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'bids' && (
          /* Bids Tab */
          <div className="space-y-6">
            {/* Info Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Smart Auction System</p>
                  <ul className="space-y-1 text-xs">
                    <li>• <strong>Auto-Accept:</strong> When you set an auction end time, the highest bid is automatically accepted</li>
                    <li>• <strong>Bid Replacement:</strong> Better bids (higher price × quantity) automatically replace lower ones</li>
                    <li>• <strong>Outbid Notifications:</strong> Distributors are notified when they're outbid</li>
                    <li>• <strong>Real-time Countdown:</strong> See exactly when auctions end</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Bids Received on Your Produce</h2>
             
             {receivedBids.length > 0 ? (
               <div className="space-y-4">
                 {receivedBids.map((bid) => (
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
                           <p className="text-sm text-gray-500">Bid by: {bid.distributor?.email}</p>
                           <div className="flex items-center space-x-4 mt-1 text-sm">
                             <span className="text-emerald-600 font-medium">Bid: ₹{bid.bid_amount}/kg</span>
                             <span className="text-gray-500">Quantity: {bid.bid_quantity}kg</span>
                           </div>
                           
                           {/* Auction countdown for active auctions */}
                           {bid.produce?.auction_end_time && bid.produce?.status === 'active' && (
                             <div className="mt-1">
                               <span className="text-xs text-orange-600">
                                 Auction ends: <AuctionCountdown endTime={bid.produce.auction_end_time} />
                               </span>
                             </div>
                           )}
                           
                           {/* Outbid notification */}
                           {bid.status === 'replaced' && bid.replaced_by_bid && (
                             <div className="mt-1">
                               <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                                 ⚠️ Outbid by a better offer
                               </span>
                             </div>
                           )}
                         </div>
                       </div>
                       
                       <div className="text-right">
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                           bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                           bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                           bid.status === 'replaced' ? 'bg-orange-100 text-orange-800' :
                           'bg-red-100 text-red-800'
                         }`}>
                           {bid.status === 'pending' ? 'Pending' :
                            bid.status === 'accepted' ? 'Accepted' : 
                            bid.status === 'replaced' ? 'Replaced' :
                            'Rejected'}
                         </span>
                         <p className="text-xs text-gray-500 mt-1">
                           {new Date(bid.created_at).toLocaleDateString()}
                         </p>
                         
                         {bid.status === 'pending' && (
                           <div className="flex space-x-2 mt-2">
                             <button
                               onClick={() => handleBidAction(bid.id, 'accepted')}
                               className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                             >
                               Accept
                             </button>
                             <button
                               onClick={() => handleBidAction(bid.id, 'rejected')}
                               className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                             >
                               Reject
                             </button>
                           </div>
                         )}
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-8">
                 <Gavel className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                 <h3 className="text-lg font-medium text-gray-900 mb-2">No bids received yet</h3>
                 <p className="text-gray-500">When distributors bid on your produce, you'll see them here.</p>
               </div>
             )}
           </div>
         </div>
        )}

        {activeTab === 'equipment' && (
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Equipment Marketplace</h2>
              <span className="text-sm text-gray-500">Browse agricultural equipment from verified sellers</span>
            </div>
            
            <EquipmentMarketplace />
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingItem ? 'Edit Listing' : 'Add New Listing'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      resetForm();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Image Upload */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Product Image *
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-emerald-300 rounded-xl cursor-pointer hover:border-emerald-400 transition-colors">
                      {imagePreview ? (
                        <div className="relative w-full h-full">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setSelectedImage(null);
                            }}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 text-emerald-400 mb-2" />
                          <p className="text-sm text-gray-500">Click to upload image</p>
                          <p className="text-xs text-gray-400">Max 5MB, JPG/PNG</p>
                        </div>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageSelect}
                        required={!editingItem}
                      />
                    </label>
                  </div>
                  
                  {/* Upload Progress */}
                  {uploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${imageUploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>

                {/* Basic Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="e.g., Organic Tomatoes"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Price *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="e.g., ₹45/kg"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Quantity Available *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="e.g., 50kg available"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Harvest Date
                    </label>
                    <input
                      type="text"
                      value={formData.harvestDate}
                      onChange={(e) => handleInputChange('harvestDate', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="e.g., Today, Yesterday"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="e.g., Pune, Maharashtra"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Describe your product, farming practices, quality, etc."
                  />
                </div>

                {/* Certifications */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Certifications & Features
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {certificationOptions.map(cert => (
                      <button
                        key={cert}
                        type="button"
                        onClick={() => handleCertificationToggle(cert)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          formData.certifications.includes(cert)
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {cert}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., premium, organic, local, fresh"
                  />
                </div>

                {/* Auction End Time */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Auction End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.auctionEndTime}
                    onChange={(e) => handleInputChange('auctionEndTime', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., 2023-12-31T23:59"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      resetForm();
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || uploading}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 flex items-center space-x-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{editingItem ? 'Update Listing' : 'Add Listing'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {activeTab === 'listings' && (
          /* My Listings */
          <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">My Produce Listings</h2>
            <span className="text-sm text-gray-500">{myListings.length} listings</span>
          </div>

          {myListings.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No listings yet</h3>
              <p className="text-gray-500 mb-6">Start by adding your first produce listing to connect with consumers!</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition-all"
              >
                Add Your First Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myListings.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="relative">
                    <img
                      src={item.image_url || "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=500&fit=crop&crop=center"}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                     <div className="absolute top-3 right-3">
                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                         item.status === 'active' 
                           ? 'bg-emerald-100 text-emerald-700' 
                           : item.status === 'sold_out'
                           ? 'bg-red-100 text-red-700'
                           : item.status === 'auction_ended'
                           ? 'bg-purple-100 text-purple-700'
                           : 'bg-gray-100 text-gray-600'
                       }`}>
                         {item.status === 'active' ? 'Active' : 
                          item.status === 'sold_out' ? 'Sold Out' : 
                          item.status === 'auction_ended' ? 'Auction Ended' :
                          'Inactive'}
                       </span>
                     </div>
                     
                     {/* Auction End Time Badge */}
                     {item.auction_end_time && item.status === 'active' && (
                       <div className="absolute top-3 left-3">
                         <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                           <AuctionCountdown endTime={item.auction_end_time} />
                         </div>
                       </div>
                     )}
                  </div>

                  <div className="p-4">
                                         <div className="flex items-start justify-between mb-2">
                       <h3 className="font-semibold text-gray-800 text-lg">{item.name}</h3>
                       <span className="text-emerald-600 font-bold">Price: {item.price}</span>
                     </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">{item.location}</span>
                    </div>

                                         <div className="flex items-center space-x-2 mb-3">
                       <Package className="w-4 h-4 text-gray-400" />
                       <span className="text-sm text-gray-500">Available: {item.quantity}</span>
                     </div>

                    {item.certifications && item.certifications.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.certifications.slice(0, 3).map((cert, index) => (
                          <span key={index} className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                            {cert}
                          </span>
                        ))}
                        {item.certifications.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{item.certifications.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Highest Bid Display */}
                    {(() => {
                      const highestBid = getHighestBidForListing(item.id);
                      return highestBid ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 mb-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-emerald-700 font-medium">Highest Bid:</span>
                            <span className="text-emerald-800 font-bold">₹{highestBid.bid_amount}/kg × {highestBid.bid_quantity}kg</span>
                          </div>
                          <div className="text-xs text-emerald-600 mt-1">
                            Total: ₹{(parseFloat(highestBid.bid_amount) * parseFloat(highestBid.bid_quantity)).toFixed(2)}
                          </div>
                        </div>
                      ) : null;
                    })()}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{item.rating || 0}</span>
                        </div>
                        <span className="text-xs text-gray-400">({item.reviews_count || 0} reviews)</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStatus(item.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            item.status === 'active'
                              ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                              : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

// Equipment Marketplace Component
const EquipmentMarketplace = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    'All', 'Hand Tools', 'Power Tools', 'Irrigation Systems', 'Harvesting Equipment', 
    'Soil Testing Kits', 'Pest Control Tools', 'Storage Solutions', 'Other'
  ];

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('equipment_listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEquipment(data || []);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setError('Failed to fetch equipment');
    } finally {
      setLoading(false);
    }
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wrench className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
        <p className="text-gray-600">Loading equipment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading equipment</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchEquipment}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search equipment by name, description, or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex-shrink-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Equipment Grid */}
      {filteredEquipment.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No equipment found</h3>
          <p className="text-gray-500">
            {searchTerm || selectedCategory !== 'All' 
              ? 'Try adjusting your search or filter criteria'
              : 'Equipment sellers will start listing their products soon!'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
            >
              <div className="relative">
                <img
                  src={item.image_url || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=500&fit=crop&crop=center"}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                
                {/* Certification Badge */}
                {item.is_certified && (
                  <div className="absolute top-3 left-3">
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                      <Shield className="w-3 h-3" />
                      <span>Certified</span>
                    </div>
                  </div>
                )}
                
                {/* Category Badge */}
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 text-lg">{item.name}</h3>
                  <span className="text-blue-600 font-bold">Price: {item.price}</span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                
                <div className="space-y-2 mb-3">
                  {item.brand && item.model && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Package className="w-4 h-4" />
                      <span>{item.brand} {item.model}</span>
                    </div>
                  )}
                  
                  {item.location && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{item.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Condition: {item.condition}</span>
                  </div>
                </div>

                {/* Certifications */}
                {item.certifications && item.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.certifications.slice(0, 3).map((cert, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>{cert}</span>
                      </span>
                    ))}
                    {item.certifications.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{item.certifications.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Features */}
                {item.features && item.features.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.features.slice(0, 3).map((feature, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {feature}
                      </span>
                    ))}
                    {item.features.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{item.features.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{item.rating || 0}</span>
                    </div>
                    <span className="text-xs text-gray-400">({item.reviews_count || 0} reviews)</span>
                  </div>
                  
                  <button
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => {
                      // TODO: Implement contact seller functionality
                      alert('Contact seller functionality coming soon!');
                    }}
                  >
                    Contact Seller
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// Auction Countdown Timer Component
const AuctionCountdown = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const difference = end - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else if (minutes > 0) {
          setTimeLeft(`${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${seconds}s`);
        }
      } else {
        setTimeLeft('Auction Ended');
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const isEndingSoon = () => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const difference = end - now;
    return difference < 24 * 60 * 60 * 1000; // Less than 24 hours
  };

  return (
    <div className={`text-xs font-medium ${
      isEndingSoon() ? 'text-red-600' : 'text-orange-600'
    }`}>
      {timeLeft}
    </div>
  );
};

export default FarmerDashboard;
