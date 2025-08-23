import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Plus, 
  X, 
  Save, 
  Trash2, 
  Edit3, 
  Eye,
  ArrowLeft,
  Wrench,
  DollarSign,
  MapPin,
  Calendar,
  Package,
  Tag,
  Star,
  AlertCircle,
  Shield,
  Award,
  CheckCircle
} from 'lucide-react';
import { supabase, getStorageBucket } from '../../supabaseClient.js';

const EquipmentSellerDashboard = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [myEquipment, setMyEquipment] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Hand Tools',
    brand: '',
    model: '',
    condition: 'New',
    warranty: '',
    location: '',
    certifications: [],
    features: [],
    specifications: {}
  });

  // Image handling
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);

  const categories = [
    'Hand Tools', 'Power Tools', 'Irrigation Systems', 'Harvesting Equipment', 
    'Soil Testing Kits', 'Pest Control Tools', 'Storage Solutions', 'Other'
  ];

  const conditionOptions = ['New', 'Like New', 'Good', 'Fair', 'Used'];

  const certificationOptions = [
    'ISO Certified', 'CE Marked', 'BIS Certified', 'FSSAI Approved', 
    'Organic Certified', 'Quality Assured', 'Safety Certified', 'Warranty Covered'
  ];

  const featureOptions = [
    'Weather Resistant', 'Ergonomic Design', 'Lightweight', 'Durable', 
    'Easy to Use', 'Low Maintenance', 'Energy Efficient', 'Portable'
  ];

  // Check user authentication and role on component mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          const role = user.user_metadata?.user_role || 'equipment_seller';
          setUserRole(role);
        }
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // Fetch equipment when user is available
  useEffect(() => {
    if (user && user.id) {
      fetchMyEquipment();
    }
  }, [user]);

  const fetchMyEquipment = async () => {
    try {
      if (!user || !user.id) {
        console.log('User not available yet, skipping fetch');
        return;
      }

      const { data, error } = await supabase
        .from('equipment_listings')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyEquipment(data || []);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setError('Failed to fetch your equipment');
    }
  };

  const uploadImage = async (file) => {
    try {
      setUploading(true);
      setImageUploadProgress(0);

      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `equipment_${user.id}_${Date.now()}.${fileExt}`;

      const { data, error } = await getStorageBucket().upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

      if (error) {
        console.error('Storage upload error:', error);
        if (error.message.includes('row-level security policy')) {
          throw new Error('Storage access denied. Please check your storage bucket policies.');
        }
        throw error;
      }

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
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

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

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleSpecificationChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [key]: value
      }
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      category: 'Hand Tools',
      brand: '',
      model: '',
      condition: 'New',
      warranty: '',
      location: '',
      certifications: [],
      features: [],
      specifications: {}
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
      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }

      let imageUrl = imagePreview;

      if (selectedImage) {
        try {
          imageUrl = await uploadImage(selectedImage);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          imageUrl = null;
          setError('Image upload failed, but you can still save the listing without an image.');
        }
      }

      const equipmentData = {
        name: formData.name,
        price: formData.price,
        description: formData.description,
        category: formData.category,
        brand: formData.brand,
        model: formData.model,
        condition: formData.condition,
        warranty: formData.warranty,
        location: formData.location,
        certifications: formData.certifications,
        features: formData.features,
        specifications: formData.specifications,
        image_url: imageUrl,
        seller_id: user.id,
        is_certified: formData.certifications.length > 0,
        certification_count: formData.certifications.length
      };

      if (editingItem) {
        const { data, error } = await supabase
          .from('equipment_listings')
          .update(equipmentData)
          .eq('id', editingItem.id)
          .eq('seller_id', user.id)
          .select()
          .single();

        if (error) throw error;

        setMyEquipment(prev => prev.map(item => 
          item.id === editingItem.id ? data : item
        ));
      } else {
        const { data, error } = await supabase
          .from('equipment_listings')
          .insert(equipmentData)
          .select()
          .single();

        if (error) throw error;

        setMyEquipment(prev => [data, ...prev]);
      }

      resetForm();
      setShowAddForm(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving equipment:', error);
      setError(error.message || 'Failed to save equipment');
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
      brand: item.brand,
      model: item.model,
      condition: item.condition,
      warranty: item.warranty,
      location: item.location,
      certifications: item.certifications || [],
      features: item.features || [],
      specifications: item.specifications || {}
    });
    setImagePreview(item.image_url);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this equipment listing?')) {
      try {
        if (!user || !user.id) {
          throw new Error('User not authenticated');
        }

        const { error } = await supabase
          .from('equipment_listings')
          .delete()
          .eq('id', id)
          .eq('seller_id', user.id);

        if (error) throw error;

        setMyEquipment(prev => prev.filter(item => item.id !== id));
      } catch (error) {
        console.error('Error deleting equipment:', error);
        setError('Failed to delete equipment');
      }
    }
  };

  const toggleStatus = async (id) => {
    try {
      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }

      const currentItem = myEquipment.find(item => item.id === id);
      const newStatus = currentItem.status === 'active' ? 'inactive' : 'active';

      const { error } = await supabase
        .from('equipment_listings')
        .update({ status: newStatus })
        .eq('id', id)
        .eq('seller_id', user.id);

      if (error) throw error;

      setMyEquipment(prev => prev.map(item => 
        item.id === id ? { ...item, status: newStatus } : item
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update equipment status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-lg border-b border-blue-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a href="/swipe" className="p-2 hover:bg-blue-100 rounded-xl transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </a>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Equipment Seller Dashboard</h1>
                  <p className="text-sm text-gray-500">Manage your agricultural equipment listings</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Equipment</span>
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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Wrench className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{myEquipment.length}</p>
                <p className="text-sm text-gray-500">Total Equipment</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {myEquipment.filter(item => item.is_certified).length}
                </p>
                <p className="text-sm text-gray-500">Certified Items</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {myEquipment.filter(item => item.status === 'active').length}
                </p>
                <p className="text-sm text-gray-500">Active Listings</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {myEquipment.reduce((sum, item) => sum + (item.certification_count || 0), 0)}
                </p>
                <p className="text-sm text-gray-500">Total Certifications</p>
              </div>
            </div>
          </div>
        </div>

        {/* Equipment Listings */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">My Equipment Listings</h2>
            <span className="text-sm text-gray-500">{myEquipment.length} listings</span>
          </div>

          {myEquipment.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No equipment listed yet</h3>
              <p className="text-gray-500 mb-6">Start by adding your first agricultural equipment to help farmers!</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                Add Your First Equipment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEquipment.map((item) => (
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
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.status === 'active' ? 'Active' : 'Inactive'}
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
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Package className="w-4 h-4" />
                        <span>{item.brand} {item.model}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{item.location}</span>
                      </div>
                      
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
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStatus(item.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            item.status === 'active'
                              ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                              : 'text-green-600 hover:text-green-700 hover:bg-green-50'
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
      </div>

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
                  {editingItem ? 'Edit Equipment' : 'Add New Equipment'}
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
                  Equipment Image *
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors">
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
                        <Upload className="w-8 h-8 text-blue-400 mb-2" />
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
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${imageUploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>

              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Equipment Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Professional Pruning Shears"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., ₹1,200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Bosch, Makita"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Model
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., PS-1000"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Condition *
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => handleInputChange('condition', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {conditionOptions.map(cond => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Warranty
                  </label>
                  <input
                    type="text"
                    value={formData.warranty}
                    onChange={(e) => handleInputChange('warranty', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 2 years"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Mumbai, Maharashtra"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your equipment, features, benefits, etc."
                />
              </div>

              {/* Certifications */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Certifications & Standards
                </label>
                <div className="flex flex-wrap gap-2">
                  {certificationOptions.map(cert => (
                    <button
                      key={cert}
                      type="button"
                      onClick={() => handleCertificationToggle(cert)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        formData.certifications.includes(cert)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cert}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Certifications help farmers identify genuine, quality equipment
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Key Features
                </label>
                <div className="flex flex-wrap gap-2">
                  {featureOptions.map(feature => (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => handleFeatureToggle(feature)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        formData.features.includes(feature)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {feature}
                    </button>
                  ))}
                </div>
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
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingItem ? 'Update Equipment' : 'Add Equipment'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EquipmentSellerDashboard;
